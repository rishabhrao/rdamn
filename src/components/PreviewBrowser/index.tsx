/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import { useEffect, useRef, useState } from "react"

/**
 * Shape of properties provided to the PreviewBrowser component
 *
 * @export
 */
export type PreviewBrowserPropsType = {
	defaultUrl: string
	proxyUrl: string
}

/**
 * A Preview Browser component to display a mini-browser preview of a website
 *
 * @export
 * @param {PreviewBrowserPropsType} props Properties provided to the PreviewBrowser component like the url of website
 * @return {JSX.Element}
 * @example
 * ```tsx
 * <PreviewBrowser defaultUrl="https://rdamn.cloud" proxyUrl={`https://rdamn.cloud`} />
 * ```
 */
const PreviewBrowser = (props: PreviewBrowserPropsType): JSX.Element => {
	const { defaultUrl, proxyUrl } = props
	const loadingUrl = "//loading"

	const [url, setUrl] = useState(loadingUrl)

	const iframeElementRef = useRef<HTMLIFrameElement>(null)

	useEffect(() => {
		const checkIsPreviewUpInterval = setInterval(() => {
			void fetch("/api/playground/isPreviewUp", {
				method: "POST",
				body: JSON.stringify({
					url: defaultUrl,
				}),
				headers: { "Content-Type": "application/json" },
			})
				.then(response => {
					if (response && response.status === 200) {
						if (url !== proxyUrl) {
							setUrl(proxyUrl)
						}
						if (iframeElementRef.current && iframeElementRef.current.src !== proxyUrl) {
							iframeElementRef.current.src = proxyUrl
						}
					} else {
						throw ""
					}
				})
				.catch(() => {
					if (url !== loadingUrl) {
						setUrl(loadingUrl)
					}
					if (iframeElementRef.current && iframeElementRef.current.src !== loadingUrl) {
						iframeElementRef.current.src = loadingUrl
					}
				})
		}, 5000)

		return () => clearInterval(checkIsPreviewUpInterval)
	}, [defaultUrl, proxyUrl, url])

	return url === loadingUrl ? (
		<div className="flex flex-col items-center justify-center w-full h-full text-center text-white bg-gray-900">
			<div className="w-32 h-32 mb-10 border-b-2 border-white rounded-full animate-spin"></div>
			<h1 className="text-lg font-semibold">
				Waiting for live server on
				<br />
				{defaultUrl}
			</h1>
		</div>
	) : (
		<div className="flex flex-col w-full h-full">
			<div className="relative z-10 flex py-1 bg-gray-900 shadow-sm overflow-x-clip">
				<div className="flex items-center justify-between">
					{/* 
					// TODO figure out a way to refresh and go back and forward in history of PreviewBrowser
					*/}
					{/* <button className="btn btn-ghost btn-sm btn-square" onClick={() => {}}>
						<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2 fill-white" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
								clipRule="evenodd"
							/>
						</svg>
					</button> */}

					{/* <button className="btn btn-ghost btn-sm btn-square" onClick={() => {}}>
						<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2 fill-white" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
								clipRule="evenodd"
							/>
						</svg>
					</button> */}

					{/* <button className="btn btn-ghost btn-sm btn-square" onClick={() => {}}>
						<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2 fill-white" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
								clipRule="evenodd"
							/>
						</svg>
					</button> */}

					<button
						className="btn btn-ghost btn-sm btn-square"
						onClick={() => {
							if (iframeElementRef.current) {
								iframeElementRef.current.src = url
							}
						}}
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-1 stroke-white" fill="none" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
							/>
						</svg>
					</button>
				</div>

				<div className="text-sm flex-grow select-none bg-white rounded-sm flex items-center border-1 border-gray-100 py-1 mx-2 my-0.5 break-all">
					<div className="flex min-w-fit">
						{url.startsWith("https://") ? (
							<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2 mr-1 fill-success" viewBox="0 0 1024 1024">
								<path d="M832 464h-68V240c0-70.7-57.3-128-128-128H388c-70.7 0-128 57.3-128 128v224h-68c-17.7 0-32 14.3-32 32v384c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V496c0-17.7-14.3-32-32-32zM332 240c0-30.9 25.1-56 56-56h248c30.9 0 56 25.1 56 56v224H332V240zm460 600H232V536h560v304zM484 701v53c0 4.4 3.6 8 8 8h40c4.4 0 8-3.6 8-8v-53a48.01 48.01 0 1 0-56 0z"></path>
							</svg>
						) : (
							<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2 mr-1 stroke-gray-600" viewBox="0 0 24 24" fill="none">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						)}
					</div>

					{url}
				</div>

				<div className="flex items-center">
					<a className="btn btn-ghost btn-sm btn-square" href={url} target="_blank" rel="noreferrer">
						<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2 stroke-white" fill="none" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
						</svg>
					</a>
				</div>
			</div>

			<div className="relative flex-grow">
				<iframe
					ref={iframeElementRef}
					src={url}
					sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-orientation-lock allow-pointer-lock"
					className="absolute top-0 left-0 w-full h-full border-0"
				></iframe>
			</div>
		</div>
	)
}

export default PreviewBrowser
