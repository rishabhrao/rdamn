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
	const { isFullScreen } = props

	return (
		<div className={`flex items-center justify-center w-full ${isFullScreen ? "h-screen" : "h-full"}`}>
			<div className="w-32 h-32 border-b-2 border-gray-900 rounded-full animate-spin"></div>
		</div>
	)
}

export default Spinner
