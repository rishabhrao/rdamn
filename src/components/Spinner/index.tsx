/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

/**
 * Shape of properties provided to the Spinner component
 *
 * @export
 */
export type SpinnerPropsType = {
	/**
	 * Whether the Spinner is being rendered on entire screen or just a part of it
	 *
	 * @type {boolean | undefined}
	 */
	isFullScreen?: boolean
	/**
	 * Whether the Spinner is being rendered on a dark bg
	 *
	 * @type {boolean | undefined}
	 */
	isDark?: boolean
}

/**
 * A Spinner component to be shown while something is loading
 *
 * @export
 * @param {SpinnerPropsType} props Properties provided to the Spinner component like whether the Spinner should cover the entire screen
 * @return {JSX.Element} A Spinner element
 * @example
 * ```tsx
 * <Spinner isFullScreen />
 * ```
 */
const Spinner = (props: SpinnerPropsType): JSX.Element => {
	const { isFullScreen, isDark } = props

	return (
		<div className={`flex items-center justify-center w-full ${isFullScreen ? "h-screen" : "h-full"}`}>
			<div className={`w-32 h-32 border-b-2 rounded-full animate-spin ${isDark ? "border-white" : "border-gray-900"}`}></div>
		</div>
	)
}

export default Spinner
