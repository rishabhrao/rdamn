/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import { getSession } from "@auth0/nextjs-auth0"
import Ajv, { JSONSchemaType } from "ajv"
import type { NextApiRequest, NextApiResponse } from "next"

const ajv = new Ajv()

type reqBodyType = {
	url: string
}

const reqBodySchema: JSONSchemaType<reqBodyType> = {
	type: "object",
	properties: {
		url: { type: "string", minLength: 1 },
	},
	required: ["url"],
	additionalProperties: false,
}

const validateReqBody = ajv.compile<reqBodyType>(reqBodySchema)

type ResponseType = {
	success: boolean
	message: string
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

	const { url } = req.body as reqBodyType

	const authSession = getSession(req, res)

	if (!authSession || typeof authSession.user.sub !== "string" || authSession.user.sub.length === 0) {
		res.status(401).send({ success: false, message: "Unauthorized!" })
		return
	}

	await fetch(url, {
		method: "GET",
	})
		.then(response => {
			if (response) {
				res.status(200).send({ success: true, message: "Preview is Up!" })
			} else {
				throw ""
			}
		})
		.catch(() => {
			res.status(500).send({ success: false, message: `Preview is not Up!` })
		})
}

export default handler
