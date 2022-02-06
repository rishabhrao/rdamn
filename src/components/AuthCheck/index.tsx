/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import { UserProfile } from "@auth0/nextjs-auth0"
import Spinner from "@components/Spinner"
import { useRouter } from "next/router"

/**
 * Shape of properties provided to the AuthCheck component
 *
 * @export
 */
export type AuthCheckPropsType = {
	/**
	 * JSX element to be rendered if AuthCheck passes
	 *
	 * @type {JSX.Element}
	 */
	children: JSX.Element
	/**
	 * Auth0 User object
	 *
	 * @type {UserProfile | undefined}
	 */
	authUser: UserProfile | undefined
	/**
	 * Whether Auth0 is loading
	 *
	 * @type {boolean}
	 */
	isAuthLoading: boolean
}

/**
 * An Auth Check component to allow only the users who are logged in to access a page or view an element
 *
 * @export
 * @param {AuthCheckPropsType} props Properties provided to the AuthCheck component like the Session object and the children to be rendered if AuthCheck passes
 * @return {JSX.Element} A HOC to be wrapped around the protected element
 * @example
 * ```tsx
 * <AuthCheck authSession={authSession} isAuthLoading={isAuthLoading}>
 * 	<p>This element is protected and only logged in users can see it.</p>
 * </AuthCheck>
 * ```
 */
const AuthCheck = (props: AuthCheckPropsType): JSX.Element => {
	const { children, authUser, isAuthLoading } = props
	const router = useRouter()

	if (isAuthLoading) return <Spinner isFullScreen />

	if (!authUser) {
		void router.push("/api/auth/login?returnTo=/playgrounds")
		return <Spinner isFullScreen />
	}

	return children
}

export default AuthCheck
