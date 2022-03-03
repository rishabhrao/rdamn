/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import { getSession } from "@auth0/nextjs-auth0"
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs"
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { connectToDatabase } from "@lib/connectToDatabase"
import { PlaygroundModel } from "@models/PlaygroundModel"
import Ajv, { JSONSchemaType } from "ajv"
import type { NextApiRequest, NextApiResponse } from "next"

const ajv = new Ajv()

type reqBodyType = {
	playgroundId: string
}

const reqBodySchema: JSONSchemaType<reqBodyType> = {
	type: "object",
	properties: {
		playgroundId: { type: "string", minLength: 1 },
	},
	required: ["playgroundId"],
	additionalProperties: false,
}

const validateReqBody = ajv.compile<reqBodyType>(reqBodySchema)

type ResponseType = {
	success: boolean
	message: string
	ecsTaskArn?: string
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

	const { playgroundId } = req.body as reqBodyType

	const authSession = getSession(req, res)

	if (!authSession || typeof authSession.user.sub !== "string" || authSession.user.sub.length === 0) {
		res.status(401).send({ success: false, message: "Unauthorized!" })
		return
	}

	const userId = authSession.user.sub

	await connectToDatabase()

	const playground = (await PlaygroundModel.findOne({ userId, playgroundId }))?.toJSON()

	if (!playground) {
		res.status(401).send({ success: false, message: "Playground could not be found..." })
		return
	}

	const startPlayground = async () => {
		if (
			!process.env.RDAMN_AWS_ACCESS_KEY_ID ||
			!process.env.RDAMN_AWS_SECRET_ACCESS_KEY ||
			!process.env.RDAMN_AWS_DEFAULT_REGION ||
			!process.env.RDAMN_AWS_TASK_DEFINITION ||
			!process.env.RDAMN_AWS_CLUSTER ||
			!process.env.RDAMN_AWS_CONTAINER_NAME ||
			!process.env.RDAMN_AWS_SECURITY_GROUP ||
			!process.env.RDAMN_AWS_SUBNET1 ||
			!process.env.RDAMN_AWS_SUBNET2 ||
			!process.env.RDAMN_AWS_BUCKET_NAME
		) {
			throw "AWS Configuration Env Variables Not Set!"
		}

		const s3Client = new S3Client({
			credentials: {
				accessKeyId: process.env.RDAMN_AWS_ACCESS_KEY_ID,
				secretAccessKey: process.env.RDAMN_AWS_SECRET_ACCESS_KEY,
			},
			region: process.env.RDAMN_AWS_DEFAULT_REGION,
		})

		const s3ObjectDetails = {
			Bucket: process.env.RDAMN_AWS_BUCKET_NAME,
			Key: playground.playgroundId,
		}

		const signedPutUrl = await getSignedUrl(s3Client, new PutObjectCommand(s3ObjectDetails), {
			expiresIn: 24 * 60 * 60, // 1 day
		})

		const signedGetUrl = await getSignedUrl(s3Client, new GetObjectCommand(s3ObjectDetails), {
			expiresIn: 24 * 60 * 60, // 1 day
		})

		const ecsClient = new ECSClient({
			credentials: {
				accessKeyId: process.env.RDAMN_AWS_ACCESS_KEY_ID,
				secretAccessKey: process.env.RDAMN_AWS_SECRET_ACCESS_KEY,
			},
			region: process.env.RDAMN_AWS_DEFAULT_REGION,
		})

		const ecsRunTask = await ecsClient.send(
			new RunTaskCommand({
				taskDefinition: process.env.RDAMN_AWS_TASK_DEFINITION,
				cluster: process.env.RDAMN_AWS_CLUSTER,
				launchType: "FARGATE",
				networkConfiguration: {
					awsvpcConfiguration: {
						securityGroups: [process.env.RDAMN_AWS_SECURITY_GROUP],
						subnets: [process.env.RDAMN_AWS_SUBNET1, process.env.RDAMN_AWS_SUBNET2],
						assignPublicIp: "ENABLED",
					},
				},
				overrides: {
					containerOverrides: [
						{
							name: process.env.RDAMN_AWS_CONTAINER_NAME,
							environment: [
								{ name: `SIGNED_PUT_URL`, value: signedPutUrl },
								{ name: `SIGNED_GET_URL`, value: signedGetUrl },
							],
						},
					],
				},
			}),
		)

		if (!ecsRunTask?.tasks || ecsRunTask.tasks.length === 0 || !ecsRunTask.tasks[0].taskArn) {
			throw ecsRunTask
		}

		return ecsRunTask.tasks[0].taskArn
	}

	await (() => {
		if (process.env.VERCEL_ENV !== "production" && process.env.NEXT_PUBLIC_VERCEL_ENV !== "production") {
			return Promise.resolve("test")
		}

		return startPlayground()
	})()
		.then(ecsTaskArn => {
			if (ecsTaskArn) {
				res.status(201).send({ success: true, message: "Playground Started Successfully!", ecsTaskArn: ecsTaskArn })
			} else {
				throw ""
			}
		})
		.catch((error: unknown) => {
			// eslint-disable-next-line no-console
			console.error("Error:", error)

			res.status(400).send({ success: false, message: `Playground could not be started...` })
		})
}

export default handler
