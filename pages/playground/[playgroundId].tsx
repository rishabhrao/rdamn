/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import "react-reflex/styles.css"

import { getSession, useUser } from "@auth0/nextjs-auth0"
import AuthCheck from "@components/AuthCheck"
import { connectToDatabase } from "@lib/connectToDatabase"
import { PlaygroundModel, PlaygroundType } from "@models/PlaygroundModel"
import LogoIcon from "@public/logoWhite.png"
import type { GetServerSideProps, InferGetServerSidePropsType } from "next"
import dynamic from "next/dynamic"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import { Toaster } from "react-hot-toast"
import { ReflexContainer, ReflexElement, ReflexSplitter } from "react-reflex"

const Terminal = dynamic(() => import("@components/Terminal"), {
	ssr: false,
})

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

				{/* <div className="flex bg-black text-neutral-content p-0.5 pt-1">
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
				</div> */}

				<div className="h-screen">
					<ReflexContainer orientation="vertical">
						<ReflexElement flex={0.2}>
							<p>File Explorer</p>
						</ReflexElement>

						<ReflexSplitter />

						<ReflexElement flex={0.45}>
							<ReflexContainer orientation="horizontal">
								<ReflexElement flex={0.55}>
									<p>Monaco Code Editor</p>
								</ReflexElement>

								<ReflexSplitter />

								<ReflexElement flex={0.45} propagateDimensionsRate={500} propagateDimensions={true} className="h-full w-full overflow-hidden scrollbar-hide flex-grow bg-black">
									<Terminal url="http://localhost:1234" dimensions={{ height: 0, width: 0 }} />
								</ReflexElement>
							</ReflexContainer>
						</ReflexElement>

						<ReflexSplitter />

						<ReflexElement flex={0.35}>
							<p>Preview Browser</p>
						</ReflexElement>
					</ReflexContainer>
				</div>

				<Toaster />
			</>
		</AuthCheck>
	)
}

export default Playground
