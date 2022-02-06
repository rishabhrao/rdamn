/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import { toast } from "react-hot-toast"

/**
 * Status of Alert i.e. The type of Alert to be shown
 *
 * @export
 */
export enum AlertTypes {
	INFO,
	SUCCESS,
	WARNING,
	ERROR,
}

/**
 * Shape of properties provided to the Alert component
 *
 * @export
 */
export type AlertPropsType = {
	AlertType: AlertTypes
	/**
	 * Message to be shown in the Alert
	 *
	 * @type {string}
	 */
	message: string
}

/**
 * An Alert component to be used within a Toast
 *
 * @export
 * @param {AlertPropsType} props Properties provided to the Alert component like the type of alert and message to be shown
 * @return {JSX.Element}
 * @example
 * Basic:
 * ```tsx
 * <Alert AlertType={AlertTypes.SUCCESS} message={responseBody.message} />
 * ```
 * @example
 * With Toast:
 * ```tsx
 * toast.custom(<Alert AlertType={AlertTypes.SUCCESS} message="This action succeeded!" />, { position: "bottom-center", duration: 5000, id: "success" })
 * ```
 */
const Alert = (props: AlertPropsType): JSX.Element => {
	const { AlertType, message } = props

	if (AlertType === AlertTypes.INFO)
		return (
			<div className="alert alert-info">
				<div className="flex-1">
					<svg onClick={() => toast.remove()} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 mx-2 stroke-current link">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
					<label>{message}</label>
				</div>
			</div>
		)

	if (AlertType === AlertTypes.SUCCESS)
		return (
			<div className="alert alert-success">
				<div className="flex-1">
					<svg onClick={() => toast.remove()} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 mx-2 stroke-current link">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
					</svg>
					<label>{message}</label>
				</div>
			</div>
		)

	if (AlertType === AlertTypes.WARNING)
		return (
			<div className="alert alert-warning">
				<div className="flex-1">
					<svg onClick={() => toast.remove()} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 mx-2 stroke-current link">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						></path>
					</svg>
					<label>{message}</label>
				</div>
			</div>
		)

	if (AlertType === AlertTypes.ERROR)
		return (
			<div className="alert alert-error">
				<div className="flex-1">
					<svg onClick={() => toast.remove()} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 mx-2 stroke-current link">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
					</svg>
					<label>{message}</label>
				</div>
			</div>
		)

	return (
		<div className="alert">
			<div className="flex-1">
				<svg onClick={() => toast.remove()} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#2196f3" className="w-6 h-6 mx-2 link">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
				<label>{message}</label>
			</div>
		</div>
	)
}

export default Alert
