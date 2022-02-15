/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import { getSession } from "@auth0/nextjs-auth0"
import { connectToDatabase } from "@lib/connectToDatabase"
import { disconnectFromDatabase } from "@lib/disconnectFromDatabase"
import { PlaygroundModel, PlaygroundType } from "@models/PlaygroundModel"
import Ajv, { JSONSchemaType } from "ajv"
import { customAlphabet } from "nanoid"
import type { NextApiRequest, NextApiResponse } from "next"

const ajv = new Ajv()

type reqBodyType = {
	newPlaygroundName: string
}

const reqBodySchema: JSONSchemaType<reqBodyType> = {
	type: "object",
	properties: {
		newPlaygroundName: { type: "string", minLength: 1 },
	},
	required: ["newPlaygroundName"],
	additionalProperties: false,
}

const validateReqBody = ajv.compile<reqBodyType>(reqBodySchema)

type ResponseType = {
	success: boolean
	message: string
	newPlayground?: PlaygroundType
}

const handler = async function (req: NextApiRequest, res: NextApiResponse<ResponseType>) {
	if (req.method !== "POST") {
		res.status(400).send({ success: false, message: "Only POST requests allowed" })
		return
	}

	const isReqBodyValid = validateReqBody(req.body)
	if (!isReqBodyValid) {
		res.status(400).send({ success: false, message: "Values invalid. Please Check again." })
		return
	}

	const { newPlaygroundName } = req.body as reqBodyType

	const authSession = getSession(req, res)

	if (!authSession || typeof authSession.user.sub !== "string" || authSession.user.sub.length === 0) {
		res.status(401).send({ success: false, message: "Unauthorized!" })
		return
	}

	const userId = authSession.user.sub

	await connectToDatabase()

	const newPlaygroundObject: PlaygroundType = {
		createdAt: Date.now(),
		userId,
		playgroundId: customAlphabet("abcdefghijklmnopqrstuvwxyz", 36)(),
		playgroundName: newPlaygroundName,
	}

	await PlaygroundModel.create(newPlaygroundObject)
		.then(newPlayground => {
			if (newPlayground) {
				res.status(201).send({
					success: true,
					message: "Playground Created Successfully!",
					newPlayground: newPlayground.toJSON(),
				})
			} else {
				throw ""
			}
		})
		.catch((error: unknown) => {
			// eslint-disable-next-line no-console
			console.error("Error:", error)
			// eslint-disable-next-line no-console
			console.error("Stringified:", JSON.stringify(error))

			res.status(400).send({ success: false, message: `Playground could not be created...` })
		})

	await disconnectFromDatabase()
}

export default handler
