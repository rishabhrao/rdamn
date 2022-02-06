/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

let baseUrl = "http://localhost:3000"
if (process.env.VERCEL_ENV === "production" || process.env.NEXT_PUBLIC_VERCEL_ENV === "production") {
	baseUrl = "https://rdamn.vercel.app"
}

/**
 * The Canonical URL of the website, i.e. Root of the domain that is serving the website
 *
 * @export
 * @type {string}
 */
export const nextPublicBaseUrl: string = baseUrl
