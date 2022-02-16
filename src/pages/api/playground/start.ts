/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import { getSession } from "@auth0/nextjs-auth0"
import { DescribeInstancesCommand, EC2Client } from "@aws-sdk/client-ec2"
import { DescribeContainerInstancesCommand, ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs"
import { connectToDatabase } from "@lib/connectToDatabase"
import { disconnectFromDatabase } from "@lib/disconnectFromDatabase"
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
			!process.env.RDAMN_AWS_CONTAINER_NAME
		) {
			throw "AWS Configuration Env Variables Not Set!"
		}

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
				launchType: "EC2",
				overrides: {
					containerOverrides: [
						{
							name: process.env.RDAMN_AWS_CONTAINER_NAME,
							environment: [
								{
									name: "PreviewPort2",
									value: "1339",
								},
							],
						},
					],
				},
			}),
		)

		const ecsSuccessfulRunTasks = ecsRunTask.tasks

		if (!ecsSuccessfulRunTasks || ecsSuccessfulRunTasks.length === 0) {
			throw ecsRunTask
		}

		const ecsContainerInstancesDescription = await ecsClient.send(
			new DescribeContainerInstancesCommand({
				cluster: process.env.RDAMN_AWS_CLUSTER,
				containerInstances: [ecsSuccessfulRunTasks[0]?.containerInstanceArn || ""],
			}),
		)

		const ecsContainerInstances = ecsContainerInstancesDescription.containerInstances

		if (!ecsContainerInstances || ecsContainerInstances.length === 0) {
			throw ecsContainerInstancesDescription
		}

		const ec2InstanceId = ecsContainerInstances[0].ec2InstanceId

		if (!ec2InstanceId) {
			throw ecsContainerInstancesDescription
		}

		const ec2Client = new EC2Client({
			credentials: {
				accessKeyId: process.env.RDAMN_AWS_ACCESS_KEY_ID,
				secretAccessKey: process.env.RDAMN_AWS_SECRET_ACCESS_KEY,
			},
			region: process.env.RDAMN_AWS_DEFAULT_REGION,
		})

		const ec2InstancesDescription = await ec2Client.send(
			new DescribeInstancesCommand({
				InstanceIds: [ec2InstanceId],
			}),
		)

		const ec2InstanceReservations = ec2InstancesDescription.Reservations

		if (!ec2InstanceReservations || ec2InstanceReservations.length === 0) {
			throw ec2InstancesDescription
		}

		const ec2Instances = ec2InstanceReservations[0].Instances

		if (!ec2Instances || ec2Instances.length === 0) {
			throw ec2InstancesDescription
		}

		const ec2InstancePublicIpV4Address = ec2Instances[0].PublicIpAddress

		if (!ec2InstancePublicIpV4Address) {
			throw ec2InstancesDescription
		}

		return ec2InstancePublicIpV4Address
	}

	await startPlayground()
		.then(PlaygroundUrl => {
			if (PlaygroundUrl) {
				res.status(201).send({
					success: true,
					message: "Playground Started Successfully!",
					PlaygroundUrl: PlaygroundUrl,
				})
			} else {
				throw ""
			}
		})
		.catch((error: unknown) => {
			// eslint-disable-next-line no-console
			console.error("Error:", error)

			res.status(400).send({ success: false, message: `Playground could not be started...` })
		})

	await disconnectFromDatabase()
}

export default handler
