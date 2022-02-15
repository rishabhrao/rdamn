/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import { getSession, useUser } from "@auth0/nextjs-auth0"
import Alert, { AlertTypes } from "@components/Alert"
import AuthCheck from "@components/AuthCheck"
import { nextPublicBaseUrl } from "@constants/nextPublicBaseUrl"
import { connectToDatabase } from "@lib/connectToDatabase"
import { disconnectFromDatabase } from "@lib/disconnectFromDatabase"
import { PlaygroundModel, PlaygroundType } from "@models/PlaygroundModel"
import LogoIcon from "@public/logoWhite.png"
import ProfileIconWhite from "@public/ProfileIconWhite.png"
import type { GetServerSideProps, InferGetServerSidePropsType } from "next"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import toast, { Toaster } from "react-hot-toast"

export const getServerSideProps: GetServerSideProps<{ playgrounds: PlaygroundType[] }> = async ({ req, res }) => {
	const authSession = getSession(req, res)

	if (!authSession) {
		return {
			redirect: {
				destination: "/api/auth/login?returnTo=/playgrounds",
				permanent: false,
			},
		}
	}

	const userId = authSession.user.sub as string

	await connectToDatabase()

	const playgrounds = (
		await PlaygroundModel.find({ userId }, null, {
			sort: {
				createdAt: -1, // Sort by createdAt Desc
			},
		})
	).map(playground => playground.toJSON())

	await disconnectFromDatabase()

	return {
		props: { playgrounds },
	}
}

const Playgrounds = ({ playgrounds: ssrPlaygrounds }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
	const { user: authUser, isLoading: isAuthLoading } = useUser()

	const [playgrounds, setPlaygrounds] = useState(ssrPlaygrounds)

	const [isCreatePlaygroundModalOpen, setisCreatePlaygroundModalOpen] = useState(false)
	const [isCreatePlaygroundLoading, setIsCreatePlaygroundLoading] = useState(false)
	const [newPlaygroundName, setNewPlaygroundName] = useState("")

	const createNewPlayground = async () => {
		setIsCreatePlaygroundLoading(true)

		await fetch(`${nextPublicBaseUrl}/api/playgrounds/create`, {
			method: "POST",
			body: JSON.stringify({
				newPlaygroundName,
			}),
			headers: { "Content-Type": "application/json" },
		})
			.then(async res => {
				type serverResponseType = {
					success: boolean
					message: string
					newPlayground?: PlaygroundType
				}

				const responseBody = (await res.json()) as serverResponseType

				if (res.ok && responseBody.success && responseBody.newPlayground) {
					setPlaygrounds([responseBody.newPlayground, ...playgrounds])

					toast.custom(<Alert AlertType={AlertTypes.SUCCESS} message={responseBody.message} />, { position: "bottom-center", duration: 5000, id: "success" })
				} else {
					throw responseBody.message
				}
			})
			.catch((error: string) => {
				toast.custom(<Alert AlertType={AlertTypes.ERROR} message={error?.toString() || "Playground could not be created..."} />, { position: "bottom-center", duration: 5000, id: "error" })
			})

		setIsCreatePlaygroundLoading(false)
		setisCreatePlaygroundModalOpen(false)
	}

	return (
		<AuthCheck authUser={authUser} isAuthLoading={isAuthLoading}>
			<>
				<Head>
					<title>Playgrounds - rdamn</title>
					<meta property="og:title" content="Playgrounds - rdamn" key="title" />
				</Head>

				<div className="m-2 shadow-lg bg-primary navbar text-neutral-content rounded-box">
					<div className="flex-none">
						<Link href="/">
							<a role="button" className="btn btn-square btn-ghost" title="rdamn Homepage">
								<Image src={LogoIcon} alt="rdamn" width={48} height={48} />
							</a>
						</Link>
					</div>

					<div className="flex-1 mx-2">
						<span className="text-xl font-bold">rdamn Playgrounds</span>
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

				<div className="flex flex-col m-5">
					<div className="flex justify-end w-full mb-4">
						<button
							className="w-full btn btn-primary sm:w-max"
							onClick={() => {
								setNewPlaygroundName("My Awesome Playground")
								setisCreatePlaygroundModalOpen(true)
							}}
						>
							<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
							</svg>
							<span>Create</span>
						</button>
					</div>

					{playgrounds.map(playground => (
						<Link key={playground.playgroundId} href={`/playground/${playground.playgroundId}`}>
							<a className="flex flex-row w-full px-8 py-2 mb-4 cursor-pointer btn-ghost">
								<div className="flex items-center mr-6">
									<svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
								</div>

								<div className="flex flex-col flex-grow">
									<p className="mb-2 text-xl font-bold">{playground.playgroundName}</p>
									<p className="text-sm text-gray-600">
										Created on {new Date(playground.createdAt).toLocaleTimeString([], { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric" })}
									</p>
								</div>
							</a>
						</Link>
					))}

					{playgrounds.length === 0 && <p className="text-2xl font-bold text-center text-secondary">No Playgrounds yet... Create one!</p>}
				</div>

				{isCreatePlaygroundModalOpen && (
					<div className="fixed inset-0 z-10 overflow-y-auto">
						<div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
							<div className="fixed inset-0 bg-gray-700 opacity-60" />

							{/* This element is to trick the browser into centering the modal contents. */}
							<span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
								&#8203;
							</span>

							<div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
								<div className="flex justify-end w-full">
									<button className="btn btn-ghost btn-square btn-sm" disabled={isCreatePlaygroundLoading} onClick={() => setisCreatePlaygroundModalOpen(false)}>
										<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
											<path
												fillRule="evenodd"
												d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
												clipRule="evenodd"
											/>
										</svg>
									</button>
								</div>

								<div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full">
									<svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
								</div>
								<h3 className="text-lg font-medium leading-6 text-center text-gray-900">Create new Playground</h3>

								<div className="mt-2 form-control">
									<label className="label">
										<span className="label-text">Name</span>
									</label>
									<input
										type="text"
										placeholder="Playground Name"
										className="input input-primary input-bordered"
										value={newPlaygroundName}
										onChange={event => setNewPlaygroundName(event?.target.value)}
									/>
								</div>

								<div className="mt-6">
									<button
										type="button"
										className={`group disabled:cursor-not-allowed disabled:opacity-50 relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
											isCreatePlaygroundLoading ? "loading" : ""
										}`}
										disabled={isCreatePlaygroundLoading || newPlaygroundName.length === 0}
										onClick={createNewPlayground}
									>
										<span className="absolute inset-y-0 left-0 flex items-center pl-3">
											<svg
												className="w-6 h-6 text-indigo-500 group-hover:text-indigo-400"
												x-description="Heroicon name: solid/lock-closed"
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="currentColor"
												aria-hidden="true"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
												></path>
											</svg>
										</span>
										<span className="absolute inset-y-0 right-0 flex items-center pr-3">
											<svg
												className="w-6 h-6 text-indigo-500 group-hover:text-indigo-400"
												x-description="Heroicon name: solid/lock-closed"
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="currentColor"
												aria-hidden="true"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
												></path>
											</svg>
										</span>

										<p>Create Playground</p>
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				<Toaster />
			</>
		</AuthCheck>
	)
}

export default Playgrounds
