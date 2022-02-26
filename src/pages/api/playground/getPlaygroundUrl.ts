/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import { getSession } from "@auth0/nextjs-auth0"
import { DescribeNetworkInterfacesCommand, EC2Client } from "@aws-sdk/client-ec2"
import { DescribeTasksCommand, ECSClient } from "@aws-sdk/client-ecs"
import { redis } from "@lib/redis"
import Ajv, { JSONSchemaType } from "ajv"
import type { NextApiRequest, NextApiResponse } from "next"
import { generateSlug } from "random-word-slugs"

const ajv = new Ajv()

type reqBodyType = {
	ecsTaskArn: string
}

const reqBodySchema: JSONSchemaType<reqBodyType> = {
	type: "object",
	properties: {
		ecsTaskArn: { type: "string", minLength: 1 },
	},
	required: ["ecsTaskArn"],
	additionalProperties: false,
}

const validateReqBody = ajv.compile<reqBodyType>(reqBodySchema)

type ResponseType = {
	success: boolean
	message: string
	PlaygroundUrl?: string
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

	const { ecsTaskArn } = req.body as reqBodyType

	const authSession = getSession(req, res)

	if (!authSession || typeof authSession.user.sub !== "string" || authSession.user.sub.length === 0) {
		res.status(401).send({ success: false, message: "Unauthorized!" })
		return
	}

	const getPlaygroundUrl = async () => {
		if (!process.env.RDAMN_AWS_ACCESS_KEY_ID || !process.env.RDAMN_AWS_SECRET_ACCESS_KEY || !process.env.RDAMN_AWS_DEFAULT_REGION || !process.env.RDAMN_AWS_CLUSTER) {
			throw "AWS Configuration Env Variables Not Set!"
		}

		if (!process.env.DNS_SERVER) {
			throw "DNS Server URL Not Set!"
		}

		const ecsClient = new ECSClient({
			credentials: {
				accessKeyId: process.env.RDAMN_AWS_ACCESS_KEY_ID,
				secretAccessKey: process.env.RDAMN_AWS_SECRET_ACCESS_KEY,
			},
			region: process.env.RDAMN_AWS_DEFAULT_REGION,
		})

		const ecsTaskDescription = await ecsClient.send(
			new DescribeTasksCommand({
				cluster: process.env.RDAMN_AWS_CLUSTER,
				tasks: [ecsTaskArn],
			}),
		)

		if (!ecsTaskDescription?.tasks || ecsTaskDescription.tasks.length === 0 || !ecsTaskDescription.tasks[0].attachments || ecsTaskDescription.tasks[0].attachments.length === 0) {
			throw "notUpYet"
		}

		const networkInterfaceId = ecsTaskDescription.tasks[0].attachments[0].details?.find(({ name }) => name === "networkInterfaceId")?.value

		if (!networkInterfaceId) {
			throw "notUpYet"
		}

		const ec2Client = new EC2Client({
			credentials: {
				accessKeyId: process.env.RDAMN_AWS_ACCESS_KEY_ID,
				secretAccessKey: process.env.RDAMN_AWS_SECRET_ACCESS_KEY,
			},
			region: process.env.RDAMN_AWS_DEFAULT_REGION,
		})

		const ec2NetworkInterfaceDescription = await ec2Client.send(
			new DescribeNetworkInterfacesCommand({
				NetworkInterfaceIds: [networkInterfaceId],
			}),
		)

		if (
			!ec2NetworkInterfaceDescription?.NetworkInterfaces ||
			ec2NetworkInterfaceDescription.NetworkInterfaces.length === 0 ||
			!ec2NetworkInterfaceDescription.NetworkInterfaces[0].Association?.PublicIp
		) {
			throw "notUpYet"
		}

		const publicIp = ec2NetworkInterfaceDescription.NetworkInterfaces[0].Association?.PublicIp

		let slug = generateSlug(2, { format: "lower" }).split(" ").join("-")

		while (await redis.get("slug")) {
			slug = generateSlug(2, { format: "lower" }).split(" ").join("-")
		}

		await redis.set(slug, publicIp, "EX", 6 * 60 * 60) // 6 Hours

		return `${slug}.${process.env.DNS_SERVER}`
	}

	await getPlaygroundUrl()
		.then(PlaygroundUrl => {
			if (PlaygroundUrl) {
				res.status(201).send({ success: true, message: "Playground Started Successfully!", PlaygroundUrl: PlaygroundUrl })
			} else {
				throw ""
			}
		})
		.catch((error: unknown) => {
			if (error !== "notUpYet") {
				// eslint-disable-next-line no-console
				console.error("Error:", error)
			}

			res.status(400).send({ success: false, message: `Playground has not started yet...` })
		})
}

export default handler
