/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import "react-reflex/styles.css"

import { getSession, useUser } from "@auth0/nextjs-auth0"
import Alert, { AlertTypes } from "@components/Alert"
import AuthCheck from "@components/AuthCheck"
import FileExplorer from "@components/FileExplorer"
import MonacoEditor from "@components/MonacoEditor"
import Spinner from "@components/Spinner"
import { nextPublicBaseUrl } from "@constants/nextPublicBaseUrl"
import { connectToDatabase } from "@lib/connectToDatabase"
import { PlaygroundModel, PlaygroundType } from "@models/PlaygroundModel"
import LogoIcon from "@public/logoWhite.png"
import type * as monaco from "monaco-editor/esm/vs/editor/editor.api"
import type { GetServerSideProps, InferGetServerSidePropsType } from "next"
import dynamic from "next/dynamic"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import toast, { Toaster } from "react-hot-toast"
import { ReflexContainer, ReflexElement, ReflexSplitter } from "react-reflex"
import ReconnectingWebSocket from "reconnecting-websocket"
import useSWR from "swr"

const { getMaterialFileIcon } = await import("file-extension-icon-js")

const Terminal = dynamic(() => import("@components/Terminal"), {
	ssr: false,
})

const PreviewBrowser = dynamic(() => import("@components/PreviewBrowser"), {
	ssr: false,
})

const CommunicationPort = 1234
const PreviewPort = 1337
const PreviewPort2 = 1338
const ServerTTL: number = 15 * 1000 // 15 Seconds

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

	const [sideMenuSelectedTab, setSideMenuSelectedTab] = useState<"about" | "explorer" | "settings">("explorer")
	const [sideMenuFlex, setSideMenuFlex] = useState(0.2)

	const [openFiles, setOpenFiles] = useState<
		{
			filePath: string
			fileContent: string
		}[]
	>([])

	const [activeTab, setActiveTab] = useState<{
		filePath: string
		fileContent: string
	} | null>(null)

	const [editorChangesCallback, setEditorChangesCallback] = useState<{
		filePath: string
		fileContent: string
	} | null>(null)

	const [editorOptions, setEditorOptions] = useState<monaco.editor.IStandaloneEditorConstructionOptions>({
		minimap: { enabled: false },
		wordWrap: "on",
		lineNumbers: "on",
		fontSize: 14,
		tabSize: 4,
	})

	const [PlaygroundUrl, setPlaygroundUrl] = useState<string>("")
	const [PlaygroundSlug, setPlaygroundSlug] = useState<string>("")
	const [PlaygroundDnsServer, setPlaygroundDnsServer] = useState<string>("")

	const playgroundStarter = async (url: string) => {
		return fetch(`${nextPublicBaseUrl}/${url}`, {
			method: "POST",
			body: JSON.stringify({
				playgroundId: playground.playgroundId,
			}),
			headers: { "Content-Type": "application/json" },
		})
			.then(async r => {
				type serverResponseType = {
					success: boolean
					message: string
					ecsTaskArn?: string
				}

				return (await r.json()) as serverResponseType
			})
			.then(res => {
				if (res.success && res.ecsTaskArn && res.ecsTaskArn.length > 0) {
					return res.ecsTaskArn
				} else {
					throw res.message
				}
			})
			.catch((error: string) => {
				throw error?.toString() || "Playground could not be started..."
			})
	}

	const { data: ecsTaskArn } = useSWR("api/playground/start", playgroundStarter, {
		revalidateIfStale: false,
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
		shouldRetryOnError: true,
		errorRetryCount: 1,
		onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
			if (retryCount >= 1) {
				toast.custom(<Alert AlertType={AlertTypes.ERROR} message={(error as string)?.toString()} />, { position: "bottom-center", duration: 5000, id: "error" })

				return
			}
			setTimeout(() => void revalidate({ retryCount: retryCount }), 3000)
		},
	})

	const playgroundUrlFetcher = async (url: string) => {
		return fetch(`${nextPublicBaseUrl}/${url}`, {
			method: "POST",
			body: JSON.stringify({
				ecsTaskArn: ecsTaskArn,
			}),
			headers: { "Content-Type": "application/json" },
		})
			.then(async r => {
				type serverResponseType = {
					success: boolean
					message: string
					PlaygroundUrl?: string
					PlaygroundSlug?: string
					PlaygroundDnsServer?: string
				}

				return (await r.json()) as serverResponseType
			})
			.then(res => {
				if (
					res.success &&
					res.PlaygroundUrl &&
					res.PlaygroundUrl.length > 0 &&
					res.PlaygroundSlug &&
					res.PlaygroundSlug.length > 0 &&
					res.PlaygroundDnsServer &&
					res.PlaygroundDnsServer.length > 0
				) {
					setPlaygroundUrl(res.PlaygroundUrl)
					setPlaygroundSlug(res.PlaygroundSlug)
					setPlaygroundDnsServer(res.PlaygroundDnsServer)
				} else {
					throw res.message
				}
			})
			.catch((error: string) => {
				throw error?.toString() || "Playground could not be started..."
			})
	}

	useSWR(ecsTaskArn ? "api/playground/getPlaygroundUrl" : null, ecsTaskArn ? playgroundUrlFetcher : null, {
		revalidateIfStale: false,
		revalidateOnFocus: false,
		revalidateOnReconnect: true,
		shouldRetryOnError: true,
		errorRetryCount: 50,
		onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
			if (retryCount >= 50) {
				toast.custom(<Alert AlertType={AlertTypes.ERROR} message={(error as string)?.toString()} />, { position: "bottom-center", duration: 5000, id: "error" })

				return
			}
			setTimeout(() => void revalidate({ retryCount: retryCount }), 500)
		},
	})

	useEffect(() => {
		if (PlaygroundUrl.length > 0) {
			const ttlSocket = new ReconnectingWebSocket(
				`${process.env.VERCEL_ENV === "production" || process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ? "wss" : "ws"}://${PlaygroundUrl}:${CommunicationPort}/ttl`,
			)
			setInterval(() => {
				if (ttlSocket.readyState === 1) {
					ttlSocket.send("ping")
				}
			}, ServerTTL / 5)
		}
	}, [PlaygroundUrl])

	return (
		<AuthCheck authUser={authUser} isAuthLoading={isAuthLoading}>
			<>
				<Head>
					<title>{playground.playgroundName} - rdamn Playgrounds</title>
					<meta property="og:title" content={`${playground.playgroundName} - rdamn Playgrounds`} key="title" />
				</Head>

				<div className="h-screen">
					<ReflexContainer orientation="vertical">
						<ReflexElement
							flex={sideMenuFlex}
							onStopResize={({ component }) => {
								const newFlex = component.props.flex
								if (typeof newFlex === "number" && parseFloat(newFlex.toFixed(1)) === 0) {
									setSideMenuFlex(0)
								}
							}}
							minSize={50}
							className="bg-[#131313] text-white flex flex-row h-full w-full overflow-clip scrollbar-hide"
						>
							<div className="bg-[#252525] flex flex-col pr-0.5 flex-grow-0 flex-shrink-0 basis-[50px]">
								<div
									className={`mb-1 flex justify-center items-center border-l-[3px] border-solid cursor-pointer pt-1 ${
										sideMenuSelectedTab === "about" ? "border-white" : "border-[#252525] text-[#979797]"
									}`}
									onClick={() => {
										if (sideMenuSelectedTab === "about" || sideMenuFlex === 0) {
											setSideMenuFlex(sideMenuFlex === 0 ? 0.2 : 0)
										}
										setSideMenuSelectedTab("about")
									}}
								>
									<Image src={LogoIcon} alt="rdamn" width={42} height={42} />
								</div>

								<div
									className={`mb-1 flex justify-center items-center border-l-[3px] border-solid cursor-pointer ${
										sideMenuSelectedTab === "explorer" ? "border-white" : "border-[#252525] text-[#979797]"
									}`}
									onClick={() => {
										if (sideMenuSelectedTab === "explorer" || sideMenuFlex === 0) {
											setSideMenuFlex(sideMenuFlex === 0 ? 0.2 : 0)
										}
										setSideMenuSelectedTab("explorer")
									}}
								>
									<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-12" viewBox="0 0 24 24">
										<g fill="currentColor">
											<path d="M17.5 0h-9L7 1.5V6H2.5L1 7.5v15.07L2.5 24h12.07L16 22.57V18h4.7l1.3-1.43V4.5L17.5 0zm0 2.12l2.38 2.38H17.5V2.12zm-3 20.38h-12v-15H7v9.07L8.5 18h6v4.5zm6-6h-12v-15H16V6h4.5v10.5z" />
										</g>
									</svg>
								</div>

								<div
									className={`mb-1 flex justify-center items-center border-l-[3px] border-solid cursor-pointer ${
										sideMenuSelectedTab === "settings" ? "border-white" : "border-[#252525] text-[#979797]"
									}`}
									onClick={() => {
										if (sideMenuSelectedTab === "settings" || sideMenuFlex === 0) {
											setSideMenuFlex(sideMenuFlex === 0 ? 0.2 : 0)
										}
										setSideMenuSelectedTab("settings")
									}}
								>
									<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-12" viewBox="0 0 16 16">
										<g fill="currentColor">
											<path d="M9.1 4.4L8.6 2H7.4l-.5 2.4l-.7.3l-2-1.3l-.9.8l1.3 2l-.2.7l-2.4.5v1.2l2.4.5l.3.8l-1.3 2l.8.8l2-1.3l.8.3l.4 2.3h1.2l.5-2.4l.8-.3l2 1.3l.8-.8l-1.3-2l.3-.8l2.3-.4V7.4l-2.4-.5l-.3-.8l1.3-2l-.8-.8l-2 1.3l-.7-.2zM9.4 1l.5 2.4L12 2.1l2 2l-1.4 2.1l2.4.4v2.8l-2.4.5L14 12l-2 2l-2.1-1.4l-.5 2.4H6.6l-.5-2.4L4 13.9l-2-2l1.4-2.1L1 9.4V6.6l2.4-.5L2.1 4l2-2l2.1 1.4l.4-2.4h2.8zm.6 7c0 1.1-.9 2-2 2s-2-.9-2-2s.9-2 2-2s2 .9 2 2zM8 9c.6 0 1-.4 1-1s-.4-1-1-1s-1 .4-1 1s.4 1 1 1z" />
										</g>
									</svg>
								</div>
							</div>

							<div className="relative flex-grow overflow-y-auto">
								<ReflexContainer>
									<ReflexElement flex={1}>
										{sideMenuSelectedTab === "about" && (
											<div className="flex flex-col overflow-x-clip">
												<div className="bg-[#252525] text-xs px-2 pb-2 pt-3 shadow z-50 sticky flex flex-col top-0 left-0">
													<div className="flex-grow font-bold uppercase">{playground.playgroundName}</div>
													<div className="flex-grow mt-1 text-xs font-extralight">
														Created on{" "}
														{new Date(playground.createdAt).toLocaleTimeString([], {
															year: "numeric",
															month: "short",
															day: "numeric",
															hour: "numeric",
															minute: "numeric",
														})}
													</div>
												</div>

												{PlaygroundUrl.length > 0 && PlaygroundSlug.length > 0 && PlaygroundDnsServer.length > 0 && (
													<div className="p-4">
														<p>You can use the following URL + port mapping in your rdamn playground:</p>
														<p className="mt-4 break-all">
															<code>
																localhost:<span className="underline">{PreviewPort}</span>
															</code>{" "}
															maps to <br />
															<code>
																<span className="underline">https</span>://{PlaygroundSlug}.proxy.{PlaygroundDnsServer}
															</code>
														</p>
														<p className="mt-4 break-all">
															<code>
																localhost:<span className="underline">{PreviewPort}</span>
															</code>{" "}
															maps to <br />
															<code>
																http://{PlaygroundUrl}:<span className="underline">{PreviewPort}</span>
															</code>
														</p>
														<p className="mt-4 break-all">
															<code>
																localhost:<span className="underline">{PreviewPort2}</span>
															</code>{" "}
															maps to <br />
															<code>
																http://{PlaygroundUrl}:<span className="underline">{PreviewPort2}</span>
															</code>
														</p>
													</div>
												)}

												<div className="bg-[#252525] text-xs p-2 shadow z-50 sticky flex flex-col top-0 left-0">
													<div className="flex-grow font-bold uppercase">Quick Links</div>
												</div>

												<div className="flex items-center justify-center w-full p-2 mt-2">
													<Link href="/">
														<a role="link" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" title="rdamn Homepage">
															rdamn Playgrounds
														</a>
													</Link>
												</div>
											</div>
										)}

										{sideMenuSelectedTab === "explorer" &&
											(PlaygroundUrl.length > 0 ? (
												<FileExplorer
													crudSocketUrl={`${
														process.env.VERCEL_ENV === "production" || process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ? "wss" : "ws"
													}://${PlaygroundUrl}:${CommunicationPort}/crud`}
													filewatchSocketUrl={`${
														process.env.VERCEL_ENV === "production" || process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ? "wss" : "ws"
													}://${PlaygroundUrl}:${CommunicationPort}/filewatch`}
													openFiles={openFiles}
													setOpenFiles={setOpenFiles}
													activeTab={activeTab}
													setActiveTab={setActiveTab}
													editorChangesCallback={editorChangesCallback}
													setEditorChangesCallback={setEditorChangesCallback}
												/>
											) : (
												<Spinner isDark />
											))}

										{sideMenuSelectedTab === "settings" && (
											<div className="flex flex-col overflow-x-clip">
												<div className="bg-[#252525] text-xs px-2 pb-2 pt-3 shadow z-50 sticky flex flex-col top-0 left-0 overflow-x-clip">
													<div className="flex-grow font-bold uppercase">Settings</div>
												</div>

												<div className="px-4 pt-2 form-control">
													<label className="justify-start cursor-pointer label">
														<input
															type="checkbox"
															checked={editorOptions.wordWrap === "on"}
															onChange={() => setEditorOptions({ ...editorOptions, wordWrap: editorOptions.wordWrap === "on" ? "off" : "on" })}
															className="mr-3 checkbox checkbox-primary checkbox-sm"
														/>
														<span className="text-white label-text">Word Wrap</span>
													</label>
												</div>

												<div className="px-4 pt-2 form-control">
													<label className="justify-start cursor-pointer label">
														<input
															type="checkbox"
															checked={editorOptions.lineNumbers === "on"}
															onChange={() => setEditorOptions({ ...editorOptions, lineNumbers: editorOptions.lineNumbers === "on" ? "off" : "on" })}
															className="mr-3 checkbox checkbox-primary checkbox-sm"
														/>
														<span className="text-white label-text">Line Numbers</span>
													</label>
												</div>

												<div className="px-4 pt-2 form-control">
													<div className="flex flex-col">
														<span className="mb-1 text-white label-text">Font Size</span>
														<input
															type="range"
															min="10"
															max="25"
															step="1"
															className="range range-sm range-primary"
															value={editorOptions.fontSize}
															onChange={e => setEditorOptions({ ...editorOptions, fontSize: parseInt(e.target.value) })}
														/>
													</div>
												</div>

												<div className="px-4 pt-2 form-control">
													<div className="flex flex-col">
														<span className="mb-1 text-white label-text">Tab Size</span>
														<input
															type="range"
															min="0"
															max="6"
															step="2"
															className="range range-sm range-primary"
															value={editorOptions.tabSize}
															onChange={e => setEditorOptions({ ...editorOptions, tabSize: parseInt(e.target.value) })}
														/>
													</div>
												</div>
											</div>
										)}
									</ReflexElement>
								</ReflexContainer>
							</div>
						</ReflexElement>

						<ReflexSplitter className="!w-1 !bg-[#3b3b3b] !border-0" />

						<ReflexElement>
							<ReflexContainer orientation="horizontal">
								<ReflexElement flex={0.55} className="overflow-hidden scrollbar-hide">
									<div className="overflow-x-auto overflow-y-hidden flex justify-start basis-[35px] bg-[#161616] text-sm">
										{openFiles.map((openFile, openFileIdx) => (
											<div
												key={openFile.filePath}
												className={`select-none flex justify-center items-center p-2 cursor-pointer h-full border-t-2 border-solid whitespace-nowrap ${
													activeTab?.filePath === openFile.filePath
														? `bg-[#1e1e1e] text-white border-[#ff0000]`
														: `bg-[#2d2d2d] text-[#888] border-transparent hover:bg-[#292929]`
												}`}
												title={openFile.filePath.replace("/home/rdamn/", "~/")}
											>
												<div className="flex min-w-fit mr-1.5" onClick={() => setActiveTab(openFile)}>
													<Image src={getMaterialFileIcon(openFile.filePath.split("/").splice(-1).join("/"))} alt={openFile.filePath} width={18} height={18} />
												</div>
												<p onClick={() => setActiveTab(openFile)}>{openFile.filePath.split("/").splice(-1)}</p>
												<div
													onClick={() => {
														const newOpenFiles = openFiles.filter(({ filePath }) => filePath !== openFile.filePath)
														if (newOpenFiles.length > 0) {
															if (activeTab?.filePath === openFile.filePath) {
																setActiveTab(newOpenFiles[(openFileIdx - 1) % newOpenFiles.length])
															}
														} else {
															setActiveTab(null)
														}
														setOpenFiles(newOpenFiles)
													}}
													className="flex min-w-fit rounded hover:opacity-100 text-white hover:bg-gray-600 opacity-50 ml-1.5 p-0.5"
												>
													<svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px] fill-current" viewBox="0 0 20 20">
														<path
															fillRule="evenodd"
															d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
											</div>
										))}
									</div>

									{activeTab ? (
										<MonacoEditor
											path={activeTab.filePath}
											code={activeTab.fileContent}
											setCode={newCode => {
												setEditorChangesCallback({
													filePath: activeTab.filePath,
													fileContent: newCode,
												})
												setActiveTab({
													filePath: activeTab.filePath,
													fileContent: newCode,
												})
												const newOpenFiles = [...openFiles]
												const currentFile = newOpenFiles.find(openFile => openFile.filePath === activeTab.filePath)
												if (currentFile) {
													currentFile.fileContent = newCode
												}
												setOpenFiles(newOpenFiles)
											}}
											editorOptions={editorOptions}
										/>
									) : (
										<div className="w-full h-full flex justify-center items-center bg-[#131313] text-white">
											<Image src={LogoIcon} alt="rdamn" width={128} height={128} />
										</div>
									)}
								</ReflexElement>

								<ReflexSplitter className="!h-1 !bg-[#3b3b3b] !border-0" />

								<ReflexElement flex={0.45} propagateDimensionsRate={500} propagateDimensions={true} className="flex-grow w-full h-full overflow-hidden bg-black scrollbar-hide">
									{PlaygroundUrl.length > 0 ? (
										<Terminal
											socketUrl={`${
												process.env.VERCEL_ENV === "production" || process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ? "wss" : "ws"
											}://${PlaygroundUrl}:${CommunicationPort}/terminal`}
											dimensions={{ height: 0, width: 0 }}
										/>
									) : (
										<Spinner isDark />
									)}
								</ReflexElement>
							</ReflexContainer>
						</ReflexElement>

						<ReflexSplitter className="!w-1 !bg-[#3b3b3b] !border-0" />

						<ReflexElement flex={0.35} className="flex-grow w-full h-full">
							{PlaygroundUrl.length > 0 ? (
								<PreviewBrowser defaultUrl={`http://${PlaygroundUrl}:${PreviewPort}`} proxyUrl={`https://${PlaygroundSlug}.proxy.${PlaygroundDnsServer}/`} />
							) : (
								<div className="w-full h-full flex justify-center items-center bg-[#131313] text-white">
									<Spinner isDark />
								</div>
							)}
						</ReflexElement>
					</ReflexContainer>
				</div>

				<Toaster />
			</>
		</AuthCheck>
	)
}

export default Playground
