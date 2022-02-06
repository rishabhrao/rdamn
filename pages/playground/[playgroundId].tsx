/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import { getSession, useUser } from "@auth0/nextjs-auth0"
import AuthCheck from "@components/AuthCheck"
import { connectToDatabase } from "@lib/connectToDatabase"
import { PlaygroundModel, PlaygroundType } from "@models/PlaygroundModel"
import LogoIcon from "@public/logoWhite.png"
import ProfileIconWhite from "@public/ProfileIconWhite.png"
import type { GetServerSideProps, InferGetServerSidePropsType } from "next"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import { Toaster } from "react-hot-toast"

export const getServerSideProps: GetServerSideProps<{ playground: PlaygroundType }> = async ({ req, res, params }) => {
	const playgroundId = params?.playgroundId || ""

	const authSession = getSession(req, res)

	if (!authSession || playgroundId.length === 0) {
		return {
			redirect: {
				destination: "/api/auth/login?returnTo=/playgrounds",
				permanent: false,
			},
		}
	}

	const userId = authSession.user.sub as string

	await connectToDatabase()

	const playground = (await PlaygroundModel.findOne({ userId, playgroundId }))?.toJSON()

	if (!playground) {
		return {
			redirect: {
				destination: "/playgrounds",
				permanent: false,
			},
		}
	}

	return {
		props: { playground },
	}
}

const Playground = ({ playground }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
	const { user: authUser, isLoading: isAuthLoading } = useUser()

	return (
		<AuthCheck authUser={authUser} isAuthLoading={isAuthLoading}>
			<>
				<Head>
					<title>{playground.playgroundName} - rdamn Playgrounds</title>
					<meta property="og:title" content={`${playground.playgroundName} - rdamn Playgrounds`} key="title" />
				</Head>

				<div className="m-2 shadow-lg bg-primary navbar text-neutral-content rounded-box">
					<div className="flex-none">
						<Link href="/">
							<a role="button" className="btn btn-square btn-ghost" title="rdamn Homepage">
								<Image src={LogoIcon} alt="rdamn" width={48} height={48} />
							</a>
						</Link>
					</div>

					<div className="flex flex-col items-start flex-1 mx-2">
						<span className="text-xl font-bold">{playground.playgroundName} - rdamn Playgrounds</span>
						<p className="text-xs text-gray-300">
							Created on {new Date(playground.createdAt).toLocaleTimeString([], { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric" })}
						</p>
					</div>

					<div className="flex-none">
						<div className="dropdown dropdown-end">
							<div className="avatar">
								<div tabIndex={0} className="btn btn-ghost btn-square rounded-btn">
									<Image src={authUser?.picture?.length ? authUser.picture : ProfileIconWhite} alt="User Options" width={48} height={48} />
								</div>
							</div>
							<ul tabIndex={0} className="p-2 shadow menu dropdown-content bg-base-100 rounded-box w-52 text-base-content">
								<div className="p-2 my-2 text-center">
									<p className="text-sm">Logged in as:</p>
									<p className="text-blue-800">{authUser?.name}</p>
									<p className="text-sm text-purple-blue-800">{authUser?.email}</p>
								</div>

								<Link href="/api/auth/logout">
									<a role="button" className="w-full text-left btn btn-secondary">
										<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
											<path
												fillRule="evenodd"
												d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
												clipRule="evenodd"
											/>
										</svg>
										<span>Logout</span>
									</a>
								</Link>
							</ul>
						</div>
					</div>
				</div>

				<div className="flex flex-col m-5">WIP</div>

				<Toaster />
			</>
		</AuthCheck>
	)
}

export default Playground
