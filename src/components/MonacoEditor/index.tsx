/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import Spinner from "@components/Spinner"
import Editor from "@monaco-editor/react"
import type * as monaco from "monaco-editor/esm/vs/editor/editor.api"

/**
 * Shape of properties provided to the MonacoEditor component
 *
 * @export
 */
export type MonacoEditorPropsType = {
	path: string
	code: string
	setCode: (newCode: string) => void
	editorOptions: monaco.editor.IStandaloneEditorConstructionOptions
}

/**
 * A Monaco Editor component to display a code-editor window
 *
 * @export
 * @param {MonacoEditorPropsType} props Properties provided to the MonacoEditor component like the opened editor tab
 * @return {JSX.Element}
 * @example
 * ```tsx
 * <MonacoEditor path={"/home/rdamn/code/index.ts"} code={"hello"} setCode={newCode => setCode(newCode)} editorOptions={editorOptions} />
 * ```
 */
const MonacoEditor = (props: MonacoEditorPropsType): JSX.Element => {
	const { path, code, setCode, editorOptions } = props

	return (
		<Editor
			path={path}
			defaultValue={code}
			onChange={newCode => {
				if (newCode) {
					setCode(newCode)
				}
			}}
			options={editorOptions}
			loading={
				<div className="w-full h-full flex justify-center items-center bg-[#131313] text-white">
					<Spinner isDark />
				</div>
			}
			keepCurrentModel={true}
			theme="vs-dark"
		/>
	)
}

export default MonacoEditor
