/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import { useRef, useState } from "react"

/**
 * Shape of properties provided to the PreviewBrowser component
 *
 * @export
 */
export type PreviewBrowserPropsType = {
	defaultUrl: string
}

/**
 * A Preview Browser component to display a mini-browser preview of a website
 *
 * @export
 * @param {PreviewBrowserPropsType} props Properties provided to the PreviewBrowser component like the url of website
 * @return {JSX.Element}
 * @example
 * ```tsx
 * <PreviewBrowser defaultUrl="https://rdamn.vercel.app" />
 * ```
 */
const PreviewBrowser = (props: PreviewBrowserPropsType): JSX.Element => {
	const { defaultUrl } = props

	const [url] = useState(defaultUrl)

	const iframeElementRef = useRef<HTMLIFrameElement>(null)

	return (
		<div className="w-full h-full flex flex-col">
			<div className="z-10 flex py-1 bg-gray-900 relative shadow-sm">
				<div className="flex items-center justify-between">
					{/* <button className="btn btn-ghost btn-sm btn-square" onClick={() => {}}>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-white ml-2" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
								clipRule="evenodd"
							/>
						</svg>
					</button>

					<button className="btn btn-ghost btn-sm btn-square" onClick={() => {}}>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-white ml-2" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
								clipRule="evenodd"
							/>
						</svg>
					</button> */}

					{/* <button className="btn btn-ghost btn-sm btn-square" onClick={() => {}}>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-white ml-2" viewBox="0 0 20 20">
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
								iframeElementRef.current.src = defaultUrl
							}
						}}
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-white ml-2" viewBox="0 0 20 20">
							<path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
						</svg>
					</button>
				</div>

				<div className="text-sm flex-grow select-none bg-white rounded-sm flex items-center border-1 border-gray-100 py-1 mx-2 my-0.5">
					{url.startsWith("https://") ? (
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 mr-1 fill-success" viewBox="0 0 1024 1024">
							<path d="M832 464h-68V240c0-70.7-57.3-128-128-128H388c-70.7 0-128 57.3-128 128v224h-68c-17.7 0-32 14.3-32 32v384c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V496c0-17.7-14.3-32-32-32zM332 240c0-30.9 25.1-56 56-56h248c30.9 0 56 25.1 56 56v224H332V240zm460 600H232V536h560v304zM484 701v53c0 4.4 3.6 8 8 8h40c4.4 0 8-3.6 8-8v-53a48.01 48.01 0 1 0-56 0z"></path>
						</svg>
					) : (
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 mr-1 stroke-gray-600" viewBox="0 0 24 24" fill="none">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					)}

					{url}
				</div>

				<div className="flex items-center">
					<a className="btn btn-ghost btn-sm btn-square" href={url} target="_blank" rel="noreferrer">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-white mr-2" viewBox="0 0 20 20">
							<path d="m13 3 3.293 3.293-7 7 1.414 1.414 7-7L21 11V3z"></path>
							<path d="M19 19H5V5h7l-2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2v-5l-2-2v7z"></path>
						</svg>
					</a>
				</div>
			</div>

			<div className="flex-grow relative">
				<iframe
					ref={iframeElementRef}
					src={url}
					sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-orientation-lock allow-pointer-lock"
					className="border-0 w-full h-full absolute top-0 left-0"
				></iframe>
			</div>
		</div>
	)
}

export default PreviewBrowser
