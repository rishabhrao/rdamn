/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import "@styles/globals.css"
import "tailwindcss/tailwind.css"

import { UserProvider } from "@auth0/nextjs-auth0"
import type { AppProps } from "next/app"
import NextNProgress from "nextjs-progressbar"

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<UserProvider>
			<NextNProgress color="#ff0000" />

			<Component {...pageProps} />
		</UserProvider>
	)
}

export default MyApp
