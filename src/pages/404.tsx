/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import type { NextPage } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect } from "react"

const Home: NextPage = () => {
	const router = useRouter()

	useEffect(() => {
		void router.push("/")
	}, [router])

	return (
		<Head>
			<title>404 - rdamn</title>
		</Head>
	)
}

export default Home
