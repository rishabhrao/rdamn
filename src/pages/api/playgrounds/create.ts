/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import { getSession } from "@auth0/nextjs-auth0"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { connectToDatabase } from "@lib/connectToDatabase"
import { PlaygroundModel, PlaygroundType } from "@models/PlaygroundModel"
import Ajv, { JSONSchemaType } from "ajv"
import { customAlphabet } from "nanoid"
import type { NextApiRequest, NextApiResponse } from "next"

const ajv = new Ajv()

type reqBodyType = {
	newPlaygroundName: string
	newPlaygroundTemplate: string
}

const reqBodySchema: JSONSchemaType<reqBodyType> = {
	type: "object",
	properties: {
		newPlaygroundName: { type: "string", minLength: 1 },
		newPlaygroundTemplate: { type: "string", minLength: 1 },
	},
	required: ["newPlaygroundName", "newPlaygroundTemplate"],
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

	const { newPlaygroundName, newPlaygroundTemplate } = req.body as reqBodyType

	const authSession = getSession(req, res)

	if (!authSession || typeof authSession.user.sub !== "string" || authSession.user.sub.length === 0) {
		res.status(401).send({ success: false, message: "Unauthorized!" })
		return
	}

	const userId = authSession.user.sub

	await connectToDatabase()

	const createPlayground = async () => {
		if (!process.env.RDAMN_AWS_ACCESS_KEY_ID || !process.env.RDAMN_AWS_SECRET_ACCESS_KEY || !process.env.RDAMN_AWS_DEFAULT_REGION || !process.env.RDAMN_AWS_BUCKET_NAME) {
			throw "AWS Configuration Env Variables Not Set!"
		}

		const s3Client = new S3Client({
			credentials: {
				accessKeyId: process.env.RDAMN_AWS_ACCESS_KEY_ID,
				secretAccessKey: process.env.RDAMN_AWS_SECRET_ACCESS_KEY,
			},
			region: process.env.RDAMN_AWS_DEFAULT_REGION,
		})

		const newPlaygroundId = customAlphabet("abcdefghijklmnopqrstuvwxyz", 36)()

		const s3ObjectDetails = {
			Bucket: process.env.RDAMN_AWS_BUCKET_NAME,
			Key: newPlaygroundId,
		}

		const templateZipUrl = `https://github.com/rishabhrao/rdamn-template-${newPlaygroundTemplate}/archive/refs/heads/main.zip`

		const templateZip = await fetch(templateZipUrl, {
			method: "GET",
		})

		const templateZipBuffer = Buffer.from(await templateZip.arrayBuffer())

		await s3Client.send(
			new PutObjectCommand({
				...s3ObjectDetails,
				ContentType: "application/zip",
				Body: templateZipBuffer,
			}),
		)

		const newPlaygroundObject: PlaygroundType = {
			createdAt: Date.now(),
			userId,
			playgroundId: newPlaygroundId,
			playgroundName: newPlaygroundName,
			playgroundTemplate: newPlaygroundTemplate,
		}

		return await PlaygroundModel.create(newPlaygroundObject)
	}

	await createPlayground()
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
}

export default handler
