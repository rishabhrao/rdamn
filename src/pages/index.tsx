/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import LogoIcon from "@public/logoWhite.png"
import type { NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"

const Home: NextPage = () => {
	return (
		<>
			<Head>
				<title>rdamn - Online Playground IDEs</title>

				<meta name="description" content="Online Playground IDEs" />

				<meta name="theme-color" content="#000000" />

				<meta property="og:title" content="rdamn" />
				<meta property="og:description" content="Online Playground IDEs" />
				<meta property="og:image" content="https://ik.imagekit.io/rishabhrao/rdamn/OGImage.png" />
				<meta property="og:image:type" content="image/png" />
				<meta property="og:image:alt" content="rdamn Landing Page" />
				<meta property="og:image:width" content="1200" />
				<meta property="og:image:height" content="630" />
				<meta property="og:url" content="https://rdamn.cloud" />
				<meta property="og:type" content="website" />
			</Head>

			<div className="bg-white">
				<main>
					<div className="pt-8 overflow-hidden bg-gray-900 sm:pt-12 lg:relative lg:py-48">
						<div className="max-w-md px-4 mx-auto sm:max-w-3xl sm:px-6 lg:px-8 lg:max-w-7xl lg:grid lg:grid-cols-2 lg:gap-24">
							<div>
								<div>
									<Link href="/" passHref>
										<Image height={64} width={64} src={LogoIcon} alt="rdamn Logo" />
									</Link>
								</div>

								<div className="mt-4 sm:max-w-xl">
									<h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">rdamn</h1>

									<p className="mt-4 text-xl text-gray-300">Online Playground IDEs</p>
								</div>

								<div className="mt-12 sm:max-w-lg sm:w-full sm:flex">
									<div className="mt-4 sm:mt-0 sm:ml-3">
										<Link href="/playgrounds">
											<a className="block w-full px-5 py-3 text-lg font-bold text-center text-black bg-red-500 border border-transparent rounded-md shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:px-10">
												Take me to the Playgrounds!
											</a>
										</Link>

										<p className="mt-3 text-xs text-center text-gray-300">You will have to login to access the Playgrounds</p>
									</div>
								</div>
							</div>
						</div>

						<div className="md:mx-auto md:max-w-3xl md:px-6">
							<div className="py-12 md:relative md:mt-12 md:py-16 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
								<div className="hidden md:block">
									<div className="absolute w-screen bg-gray-800 inset-y-10 left-1/2 rounded-l-3xl lg:left-80 lg:right-0 lg:w-full" />
									<svg className="absolute -mr-3 top-8 right-1/2 lg:m-0 lg:left-0" width={404} height={392} fill="none" viewBox="0 0 404 392">
										<defs>
											<pattern id="837c3e70-6c3a-44e6-8854-cc48c737b659" x={0} y={0} width={20} height={20} patternUnits="userSpaceOnUse">
												<rect x={0} y={0} width={4} height={4} className="text-gray-400" fill="currentColor" />
											</pattern>
										</defs>
										<rect width={404} height={392} fill="url(#837c3e70-6c3a-44e6-8854-cc48c737b659)" />
									</svg>
								</div>

								<div className="relative px-4 md:pl-4 md:-mr-40 md:mx-auto md:max-w-3xl md:px-0 lg:max-w-none lg:h-full lg:pl-12">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img className="w-full rounded-md shadow-xl ring-1 ring-black ring-opacity-5 lg:h-full lg:w-auto lg:max-w-none" src={"/PlaygroundSS.png"} alt="rdamn Playground" />
								</div>
							</div>
						</div>
					</div>

					<div className="relative mt-12 sm:mt-24 sm:py-16">
						<div aria-hidden="true" className="hidden md:block">
							<div className="absolute inset-y-0 left-0 w-1/2 bg-gray-50 rounded-r-3xl" />
							<svg className="absolute -ml-3 top-8 left-1/2" width={404} height={392} fill="none" viewBox="0 0 404 392">
								<defs>
									<pattern id="8228f071-bcee-4ec8-905a-2a059a2cc4fb" x={0} y={0} width={20} height={20} patternUnits="userSpaceOnUse">
										<rect x={0} y={0} width={4} height={4} className="text-gray-200" fill="currentColor" />
									</pattern>
								</defs>
								<rect width={404} height={392} fill="url(#8228f071-bcee-4ec8-905a-2a059a2cc4fb)" />
							</svg>
						</div>

						<div className="max-w-md px-4 mx-auto sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
							<div className="relative px-6 py-10 overflow-hidden bg-red-500 shadow-xl rounded-2xl sm:px-12 sm:py-20">
								<div aria-hidden="true" className="absolute inset-0 -mt-72 sm:-mt-32 md:mt-0">
									<svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 1463 360">
										<path className="text-red-400 text-opacity-40" fill="currentColor" d="M-82.673 72l1761.849 472.086-134.327 501.315-1761.85-472.086z" />
										<path className="text-red-600 text-opacity-40" fill="currentColor" d="M-217.088 544.086L1544.761 72l134.327 501.316-1761.849 472.086z" />
									</svg>
								</div>

								<div className="relative">
									<div className="sm:text-center">
										<h2 className="text-3xl font-extrabold tracking-tight text-center text-white sm:text-4xl">rdamn has been shut down.</h2>
									</div>

									<div className="mt-12 sm:mx-auto sm:max-w-lg sm:flex">
										<div className="flex-1 mt-4 sm:mt-0 sm:ml-3">
											<a href="https://codedamn.com">
												<button
													type="submit"
													className="block w-full px-5 py-3 text-base font-medium text-white bg-gray-900 border border-transparent rounded-md shadow hover:bg-black focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-500 sm:px-10"
												>
													Use codedamn instead!
												</button>
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</main>

				<footer className="mt-24 bg-gray-900 sm:mt-12">
					<div className="max-w-md px-4 py-5 mx-auto overflow-hidden sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
						<p className="text-base text-center text-gray-300">
							&copy; 2024{" "}
							<a href="https://github.com/rishabhrao" target="_blank" rel="noreferrer" className="text-red-500 no-underline hover:text-red-600 link">
								Rishabh Rao
							</a>
							. All Rights Reserved.
						</p>
					</div>
				</footer>
			</div>
		</>
	)
}

export default Home
