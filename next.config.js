/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

/**
 * @type {import('next').NextConfig}
 **/
module.exports = {
	reactStrictMode: true,
	swcMinify: true,
	webpack: webpackConfig => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		webpackConfig.experiments.topLevelAwait = true
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return webpackConfig
	},
	images: {
		domains: ["avatars.githubusercontent.com", "lh3.googleusercontent.com"],
	},
}
