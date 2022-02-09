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
				<title>rdamn</title>
				<meta property="og:title" content="rdamn" key="title" />
			</Head>

			<div className="min-h-screen hero" style={{ backgroundImage: `url("https://picsum.photos/id/866/536/354?blur=2")` }}>
				<div className="hero-overlay bg-opacity-80" />

				<div className="text-center hero-content text-neutral-content">
					<div className="max-w-5xl">
						<div className="flex items-center justify-center mb-5 text-6xl font-bold">
							<a className="flex items-center justify-center mr-2" href="https://github.com/rishabhrao" title="Rishabh Rao" target="_blank" rel="noreferrer">
								<Image src={LogoIcon} alt="rdamn" width={64} height={64} />
							</a>
							<h1>rdamn</h1>
						</div>
						<p className="mb-10 text-2xl">
							Online Playground IDEs like{" "}
							<a href="https://codedamn.com" target="_blank" rel="noreferrer" className="no-underline link link-accent">
								codedamn.com<span className="inline-flex mt-1 text-sm font-light align-top">*</span>
							</a>
						</p>

						<Link href="/playgrounds">
							<a
								role="button"
								className="block w-full px-4 py-3 font-medium text-center text-white rounded-md shadow bg-gradient-to-r from-indigo-500 to-cyan-600 hover:from-indigo-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 focus:ring-offset-gray-600"
							>
								Take me to the Playgrounds!
							</a>
						</Link>
					</div>
				</div>

				<footer className="absolute bottom-0 w-full p-2">
					<div className="w-full py-1 footer bg-neutral text-neutral-content footer-center rounded-3xl">
						<div>
							<p className="font-semibold">
								© 2022{" "}
								<a href="https://github.com/rishabhrao" target="_blank" rel="noreferrer" className="no-underline link link-secondary">
									Rishabh Rao
								</a>
								. All Rights Reserved
							</p>
							<p className="-mt-1 text-sm font-light">*codedamn.com is not associated with rdamn in any way. rdamn is just one of my side projects.</p>
						</div>
					</div>
				</footer>
			</div>
		</>
	)
}

export default Home
