/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import "@szhsin/react-menu/dist/index.css"
import "@szhsin/react-menu/dist/theme-dark.css"

import { ControlledMenu, MenuItem, useMenuState } from "@szhsin/react-menu"
import AjvJtd, { JTDParser, JTDSchemaType } from "ajv/dist/jtd"
import Image from "next/image"
import objectPath from "object-path"
import * as objectPathImmutable from "object-path-immutable"
import { Dispatch, Fragment, SetStateAction, useEffect, useMemo, useState } from "react"
import useWebSocket from "react-use-websocket"
import { firstBy } from "thenby"

const { getMaterialFileIcon, getMaterialFolderIcon } = await import("file-extension-icon-js")

/**
 * Shape of properties provided to the File Explorer component
 *
 * @export
 */
export type FileExplorerPropsType = {
	crudSocketUrl: string
	filewatchSocketUrl: string
	openFiles: {
		filePath: string
		fileContent: string
	}[]
	setOpenFiles: Dispatch<
		SetStateAction<
			{
				filePath: string
				fileContent: string
			}[]
		>
	>
	activeTab: {
		filePath: string
		fileContent: string
	} | null
	setActiveTab: Dispatch<
		SetStateAction<{
			filePath: string
			fileContent: string
		} | null>
	>
	editorChangesCallback: {
		filePath: string
		fileContent: string
	} | null
	setEditorChangesCallback: Dispatch<
		SetStateAction<{
			filePath: string
			fileContent: string
		} | null>
	>
}

/**
 * A File Explorer component to get CRUD access into a remote host
 *
 * @export
 * @param {FileExplorerPropsType} props Properties provided to the File Explorer component like the url of remote socket where crud server is running
 * @return {JSX.Element}
 * @example
 * ```tsx
 *  <FileExplorer
 *		crudSocketUrl={`ws://${"localhost"}:${CommunicationPort}/crud`}
 *		filewatchSocketUrl={`ws://${"localhost"}:${CommunicationPort}/filewatch`}
 *		openFiles={openFiles}
 *		setOpenFiles={setOpenFiles}
 *		activeTab={activeTab}
 *		setActiveTab={setActiveTab}
 *		editorChangesCallback={editorChangesCallback}
 *		setEditorChangesCallback={setEditorChangesCallback}
 *	/>
 * ```
 */
const FileExplorer = (props: FileExplorerPropsType): JSX.Element => {
	const { crudSocketUrl, filewatchSocketUrl, openFiles, setOpenFiles, activeTab, setActiveTab, editorChangesCallback, setEditorChangesCallback } = props

	const ajvJtd = useMemo(() => new AjvJtd(), [])

	type CreateFolderCrudClientToServerEventType = {
		command: "createFolder"
		newFolderPath: string
	}

	const CreateFolderCrudClientToServerEventSchema: JTDSchemaType<Omit<CreateFolderCrudClientToServerEventType, "command">> = useMemo(
		() => ({
			properties: {
				newFolderPath: { type: "string" },
			},
			additionalProperties: false,
		}),
		[],
	)

	type CreateFileCrudClientToServerEventType = {
		command: "createFile"
		newFilePath: string
	}

	const CreateFileCrudClientToServerEventSchema: JTDSchemaType<Omit<CreateFileCrudClientToServerEventType, "command">> = useMemo(
		() => ({
			properties: {
				newFilePath: { type: "string" },
			},
			additionalProperties: false,
		}),
		[],
	)

	type UpdateFileCrudClientToServerEventType = {
		command: "updateFile"
		filePath: string
		fileContent: string
	}

	const UpdateFileCrudClientToServerEventSchema: JTDSchemaType<Omit<UpdateFileCrudClientToServerEventType, "command">> = useMemo(
		() => ({
			properties: {
				filePath: { type: "string" },
				fileContent: { type: "string" },
			},
			additionalProperties: false,
		}),
		[],
	)

	type ReadFolderCrudClientToServerEventType = {
		command: "readFolder"
		folderPath: string
	}

	const ReadFolderCrudClientToServerEventSchema: JTDSchemaType<Omit<ReadFolderCrudClientToServerEventType, "command">> = useMemo(
		() => ({
			properties: {
				folderPath: { type: "string" },
			},
			additionalProperties: false,
		}),
		[],
	)

	type ReadFileCrudClientToServerEventType = {
		command: "readFile"
		filePath: string
	}

	const ReadFileCrudClientToServerEventSchema: JTDSchemaType<Omit<ReadFileCrudClientToServerEventType, "command">> = useMemo(
		() => ({
			properties: {
				filePath: { type: "string" },
			},
			additionalProperties: false,
		}),
		[],
	)

	type MoveCrudClientToServerEventType = {
		command: "move"
		oldPath: string
		newPath: string
	}

	const MoveCrudClientToServerEventSchema: JTDSchemaType<Omit<MoveCrudClientToServerEventType, "command">> = useMemo(
		() => ({
			properties: {
				oldPath: { type: "string" },
				newPath: { type: "string" },
			},
			additionalProperties: false,
		}),
		[],
	)

	type DeleteCrudClientToServerEventType = {
		command: "delete"
		path: string
	}

	const DeleteCrudClientToServerEventSchema: JTDSchemaType<Omit<DeleteCrudClientToServerEventType, "command">> = useMemo(
		() => ({
			properties: {
				path: { type: "string" },
			},
			additionalProperties: false,
		}),
		[],
	)

	type CrudClientToServerEventType =
		| CreateFolderCrudClientToServerEventType
		| CreateFileCrudClientToServerEventType
		| UpdateFileCrudClientToServerEventType
		| ReadFolderCrudClientToServerEventType
		| ReadFileCrudClientToServerEventType
		| MoveCrudClientToServerEventType
		| DeleteCrudClientToServerEventType

	const CrudClientToServerEventSchema: JTDSchemaType<CrudClientToServerEventType> = useMemo(
		() => ({
			discriminator: "command",
			mapping: {
				createFolder: CreateFolderCrudClientToServerEventSchema,
				createFile: CreateFileCrudClientToServerEventSchema,
				updateFile: UpdateFileCrudClientToServerEventSchema,
				readFolder: ReadFolderCrudClientToServerEventSchema,
				readFile: ReadFileCrudClientToServerEventSchema,
				move: MoveCrudClientToServerEventSchema,
				delete: DeleteCrudClientToServerEventSchema,
			},
		}),
		[
			CreateFileCrudClientToServerEventSchema,
			CreateFolderCrudClientToServerEventSchema,
			UpdateFileCrudClientToServerEventSchema,
			DeleteCrudClientToServerEventSchema,
			MoveCrudClientToServerEventSchema,
			ReadFileCrudClientToServerEventSchema,
			ReadFolderCrudClientToServerEventSchema,
		],
	)

	const serializeCrudClientToServerEvent: (message: CrudClientToServerEventType) => string = useMemo(
		() => ajvJtd.compileSerializer(CrudClientToServerEventSchema),
		[CrudClientToServerEventSchema, ajvJtd],
	)

	type ReadFolderCrudServerToClientEventType = {
		command: "readFolder"
		folderPath: string
		folderName: string
		folderContents: {
			type: "file" | "directory"
			path: string
			name: string
		}[]
	}

	const ReadFolderCrudServerToClientEventSchema: JTDSchemaType<Omit<ReadFolderCrudServerToClientEventType, "command">> = useMemo(
		() => ({
			properties: {
				folderPath: { type: "string" },
				folderName: { type: "string" },
				folderContents: {
					elements: {
						properties: {
							type: { enum: ["file", "directory"] },
							path: { type: "string" },
							name: { type: "string" },
						},
					},
				},
			},
			additionalProperties: false,
		}),
		[],
	)

	type ReadFileCrudServerToClientEventType = {
		command: "readFile"
		filePath: string
		fileContent: string
	}

	const ReadFileCrudServerToClientEventSchema: JTDSchemaType<Omit<ReadFileCrudServerToClientEventType, "command">> = useMemo(
		() => ({
			properties: {
				filePath: { type: "string" },
				fileContent: { type: "string" },
			},
			additionalProperties: false,
		}),
		[],
	)

	type CrudServerToClientEventType = ReadFolderCrudServerToClientEventType | ReadFileCrudServerToClientEventType

	const CrudServerToClientEventSchema: JTDSchemaType<CrudServerToClientEventType> = useMemo(
		() => ({
			discriminator: "command",
			mapping: {
				readFolder: ReadFolderCrudServerToClientEventSchema,
				readFile: ReadFileCrudServerToClientEventSchema,
			},
		}),
		[ReadFileCrudServerToClientEventSchema, ReadFolderCrudServerToClientEventSchema],
	)

	const parseCrudServerToClientEvent: JTDParser<CrudServerToClientEventType> = useMemo(() => ajvJtd.compileParser(CrudServerToClientEventSchema), [CrudServerToClientEventSchema, ajvJtd])

	type DirectoryTreeType = {
		[key: string]: {
			type: "directory" | "file"
			isOpen: boolean
			path: string
			name: string
			content: DirectoryTreeType
		}
	}

	const [directoryTree, setDirectoryTree] = useState<DirectoryTreeType>({
		home: {
			type: "directory",
			isOpen: true,
			path: "/home",
			name: "home",
			content: {
				rdamn: {
					type: "directory",
					isOpen: true,
					path: "/home/rdamn",
					name: "rdamn",
					content: {
						code: {
							type: "directory",
							isOpen: true,
							path: "/home/rdamn/code",
							name: "code",
							content: {},
						},
					},
				},
			},
		},
	})

	const { sendMessage: sendCrudSocketMessage } = useWebSocket(crudSocketUrl, {
		retryOnError: true,
		shouldReconnect: () => true,
		reconnectAttempts: 999999,
		reconnectInterval: 3000,
		onOpen: () => {
			sendCrudSocketMessage(serializeCrudClientToServerEvent({ command: "readFolder", folderPath: "/home/rdamn/code" }))
		},
		onMessage: message => {
			const parsedMessage = parseCrudServerToClientEvent(message.data as string)
			if (parsedMessage) {
				switch (parsedMessage.command) {
					case "readFolder": {
						const parentFoldersTillRoot = parsedMessage.folderPath.split("/").splice(1).join(".content.") // Get all parent folders in object dot notation e.g. "/home/rdamn/code" returns "home.content.rdamn.content.code"

						const newDirectoryTree: DirectoryTreeType = objectPathImmutable.get(directoryTree, "")

						const currentDirectory = objectPath.get(newDirectoryTree, parentFoldersTillRoot) as {
							type: "directory" | "file"
							isOpen: boolean
							path: string
							name: string
							content: DirectoryTreeType
						}

						if (currentDirectory && currentDirectory.content) {
							Object.values(currentDirectory.content).forEach(folderContent => {
								if (!parsedMessage.folderContents.find(({ path }) => path === folderContent.path)) {
									const newOpenFiles = openFiles.filter(({ filePath }) => filePath !== folderContent.path)
									if (newOpenFiles.length > 0) {
										if (activeTab?.filePath === folderContent.path) {
											setActiveTab(newOpenFiles[(openFiles.findIndex(({ filePath }) => filePath === folderContent.path) - 1) % newOpenFiles.length])
										}
									} else {
										setActiveTab(null)
									}
									setOpenFiles(newOpenFiles)

									delete currentDirectory.content[folderContent.name]
								}
							})

							parsedMessage.folderContents.forEach(folderContent => {
								currentDirectory.content[folderContent.name] = {
									type: folderContent.type,
									isOpen: false,
									path: folderContent.path,
									name: folderContent.name,
									content: {},
								}
							})

							objectPath.set(newDirectoryTree, parentFoldersTillRoot, currentDirectory)

							setDirectoryTree(newDirectoryTree)
						}

						break
					}
					case "readFile": {
						const newOpenFiles = [...openFiles]

						const currentFileAlreadyOpen = newOpenFiles.find(openFile => openFile.filePath === parsedMessage.filePath)

						if (currentFileAlreadyOpen) {
							currentFileAlreadyOpen.fileContent = parsedMessage.fileContent
						} else {
							newOpenFiles.push({
								filePath: parsedMessage.filePath,
								fileContent: parsedMessage.fileContent,
							})
						}

						setOpenFiles(newOpenFiles)
						setActiveTab({
							filePath: parsedMessage.filePath,
							fileContent: parsedMessage.fileContent,
						})

						break
					}
				}
			}
		},
	})

	useEffect(() => {
		if (editorChangesCallback) {
			sendCrudSocketMessage(serializeCrudClientToServerEvent({ command: "updateFile", filePath: editorChangesCallback.filePath, fileContent: editorChangesCallback.fileContent }))
			setEditorChangesCallback(null)
		}
	}, [editorChangesCallback, sendCrudSocketMessage, serializeCrudClientToServerEvent, setEditorChangesCallback])

	const [contextMenuProps, toggleContextMenu] = useMenuState()
	const [contextMenuAnchorPoint, setContextMenuAnchorPoint] = useState({ x: 0, y: 0 })
	const [selectedContextMenuFile, setSelectedContextMenuFile] = useState<{
		type: "directory" | "file"
		path: string
		name: string
	} | null>(null)

	const [isCreateFileModalOpen, setIsCreateFileModalOpen] = useState(false)
	const [createNewFileDetails, setCreateNewFileDetails] = useState<{
		type: "directory" | "file"
		path: string
		name: string
	} | null>(null)

	const [isRenameFileModalOpen, setIsRenameFileModalOpen] = useState(false)
	const [renameFileModalNewFileName, setRenameFileModalNewFileName] = useState("")

	const [isDeleteFileModalOpen, setIsDeleteFileModalOpen] = useState(false)

	const DirectoryTreeRenderer = ({
		depth,
		directory,
	}: {
		depth: number
		directory: {
			type: string
			path: string
			name: string
			content: DirectoryTreeType
		}
	}): JSX.Element => {
		return (
			<Fragment>
				{Object.values(directory.content)
					.sort(firstBy("type").thenBy("name"))
					.map(item => {
						if (item.type === "directory") {
							return (
								<Fragment key={item.path}>
									<div
										className={`py-1 flex flex-row items-center cursor-pointer hover:bg-[#2a2d2e]`}
										title={item.path.replace("/home/rdamn/", "~/")}
										style={{ paddingLeft: depth === 1 ? 10 : depth * 25 }}
										onClick={() => {
											sendCrudSocketMessage(serializeCrudClientToServerEvent({ command: "readFolder", folderPath: item.path }))
											const parentFoldersTillRoot = item.path.split("/").splice(1).join(".content.")
											const newDirectoryTree: DirectoryTreeType = objectPathImmutable.get(directoryTree, "")

											const currentDirectory = objectPath.get(newDirectoryTree, parentFoldersTillRoot) as {
												type: "directory" | "file"
												isOpen: boolean
												path: string
												name: string
												content: DirectoryTreeType
											}

											if (currentDirectory && currentDirectory.content) {
												currentDirectory.isOpen = !currentDirectory.isOpen

												objectPath.set(newDirectoryTree, parentFoldersTillRoot, currentDirectory)

												setDirectoryTree(newDirectoryTree)
											}
										}}
										onContextMenu={e => {
											e.preventDefault()
											setSelectedContextMenuFile({
												type: item.type,
												path: item.path,
												name: item.name,
											})
											setContextMenuAnchorPoint({ x: e.clientX, y: e.clientY })
											toggleContextMenu(true)
										}}
									>
										<div className="flex min-w-fit">
											{item.isOpen ? (
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
													<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
												</svg>
											) : (
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
													<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
												</svg>
											)}
										</div>

										<div className="flex min-w-fit mr-1.5" onClick={() => sendCrudSocketMessage(serializeCrudClientToServerEvent({ command: "readFile", filePath: item.path }))}>
											<Image src={getMaterialFolderIcon(item.name)} alt={item.path} width={18} height={18} />
										</div>

										<p className="flex-grow overflow-hidden select-none text text-ellipsis opacity-80">{item.name}</p>
									</div>

									{!!item.content && item.isOpen && <DirectoryTreeRenderer depth={depth + 1} directory={item} />}
								</Fragment>
							)
						} else {
							return (
								<div
									key={item.path}
									className={`py-1 flex flex-row items-center cursor-pointer ${activeTab?.filePath === item.path ? "bg-[#37373d]" : "hover:bg-[#2a2d2e]"}`}
									title={item.path.replace("/home/rdamn/", "~/")}
									style={{ paddingLeft: depth === 1 ? 10 : depth * 25 }}
									onContextMenu={e => {
										e.preventDefault()
										setSelectedContextMenuFile({
											type: item.type,
											path: item.path,
											name: item.name,
										})
										setContextMenuAnchorPoint({ x: e.clientX, y: e.clientY })
										toggleContextMenu(true)
									}}
								>
									<div className="flex min-w-fit mr-1.5" onClick={() => sendCrudSocketMessage(serializeCrudClientToServerEvent({ command: "readFile", filePath: item.path }))}>
										<Image src={getMaterialFileIcon(item.name)} alt={item.path} width={18} height={18} />
									</div>

									<p
										className="flex-grow overflow-hidden select-none text text-ellipsis opacity-80"
										onClick={() => sendCrudSocketMessage(serializeCrudClientToServerEvent({ command: "readFile", filePath: item.path }))}
									>
										{item.name}
									</p>
								</div>
							)
						}
					})}
			</Fragment>
		)
	}

	type FileWatchServerToClientEventType = {
		event: "add" | "addDir" | "change" | "unlink" | "unlinkDir"
		path: string
	}

	const FileWatchServerToClientEventSchema: JTDSchemaType<FileWatchServerToClientEventType> = useMemo(
		() => ({
			properties: {
				event: { enum: ["add", "addDir", "change", "unlink", "unlinkDir"] },
				path: { type: "string" },
			},
			additionalProperties: false,
		}),
		[],
	)

	const parseFileWatchServerToClientEvent: JTDParser<FileWatchServerToClientEventType> = useMemo(
		() => ajvJtd.compileParser(FileWatchServerToClientEventSchema),
		[FileWatchServerToClientEventSchema, ajvJtd],
	)

	useWebSocket(filewatchSocketUrl, {
		retryOnError: true,
		shouldReconnect: () => true,
		reconnectAttempts: 999999,
		reconnectInterval: 3000,
		onMessage: message => {
			const parsedMessage = parseFileWatchServerToClientEvent(message.data as string)
			if (parsedMessage) {
				const parentFoldersTillRoot = parsedMessage.path.split("/").slice(1, -1).join(".content.")
				if (objectPath.get(directoryTree, parentFoldersTillRoot)) {
					sendCrudSocketMessage(serializeCrudClientToServerEvent({ command: "readFolder", folderPath: parsedMessage.path.split("/").slice(0, -1).join("/") }))
				}
			}
		},
	})

	return (
		<div className="select-none overflow-x-clip">
			<div className="bg-[#252525] text-xs px-2 pb-2 pt-3 shadow z-50 sticky flex items-center top-0 left-0">
				<div className="flex-grow font-bold uppercase">Explorer</div>
				<div className="flex items-center justify-center mx-1 cursor-pointer">
					<button
						className="text-base"
						onClick={() => {
							setCreateNewFileDetails({
								type: "file",
								path: "/home/rdamn/code/foo",
								name: "foo",
							})
							setIsCreateFileModalOpen(true)
						}}
					>
						<svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M9.5 1.1l3.4 3.5.1.4v2h-1V6H8V2H3v11h4v1H2.5l-.5-.5v-12l.5-.5h6.7l.3.1zM9 2v3h2.9L9 2zm4 14h-1v-3H9v-1h3V9h1v3h3v1h-3v3z"
							></path>
						</svg>
					</button>
					<button
						className="ml-3 text-base"
						onClick={() => {
							setCreateNewFileDetails({
								type: "directory",
								path: "/home/rdamn/code/baz",
								name: "baz",
							})
							setIsCreateFileModalOpen(true)
						}}
					>
						<svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M14.5 2H7.71l-.85-.85L6.51 1h-5l-.5.5v11l.5.5H7v-1H1.99V6h4.49l.35-.15.86-.86H14v1.5l-.001.51h1.011V2.5L14.5 2zm-.51 2h-6.5l-.35.15-.86.86H2v-3h4.29l.85.85.36.15H14l-.01.99zM13 16h-1v-3H9v-1h3V9h1v3h3v1h-3v3z"
							></path>
						</svg>
					</button>
				</div>
			</div>

			<div className="text-sm">{!!directoryTree.home.content.rdamn.content.code.content && <DirectoryTreeRenderer depth={1} directory={directoryTree.home.content.rdamn.content.code} />}</div>

			<ControlledMenu {...contextMenuProps} anchorPoint={contextMenuAnchorPoint} onClose={() => toggleContextMenu(false)} theming="dark">
				{selectedContextMenuFile?.type === "directory" && (
					<MenuItem
						onClick={() => {
							if (selectedContextMenuFile) {
								setCreateNewFileDetails({
									type: "file",
									path: `${selectedContextMenuFile.path}/foo`,
									name: "foo",
								})
							}
							setIsCreateFileModalOpen(true)
						}}
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 fill-current" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z"
								clipRule="evenodd"
							/>
						</svg>
						New File
					</MenuItem>
				)}

				{selectedContextMenuFile?.type === "directory" && (
					<MenuItem
						onClick={() => {
							if (selectedContextMenuFile) {
								setCreateNewFileDetails({
									type: "directory",
									path: `${selectedContextMenuFile.path}/baz`,
									name: "baz",
								})
							}
							setIsCreateFileModalOpen(true)
						}}
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 fill-current" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V9z"
							/>
						</svg>
						New Folder
					</MenuItem>
				)}

				<MenuItem
					onClick={() => {
						if (selectedContextMenuFile) {
							setRenameFileModalNewFileName(selectedContextMenuFile.name)
						}
						setIsRenameFileModalOpen(true)
					}}
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 fill-current" viewBox="0 0 20 20">
						<path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
						<path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
					</svg>
					Rename
				</MenuItem>

				<MenuItem onClick={() => setIsDeleteFileModalOpen(true)}>
					<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 fill-current" viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
							clipRule="evenodd"
						/>
					</svg>
					Delete
				</MenuItem>
			</ControlledMenu>

			{isCreateFileModalOpen && createNewFileDetails && createNewFileDetails.path.length > 0 && (
				<div className="bg-gray-900 h-[560px] relative z-[9999]">
					<div className="fixed inset-0 z-10 overflow-y-auto">
						<div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
							<div className="fixed inset-0 z-40 transition-opacity" aria-hidden="true">
								<div className="absolute inset-0 bg-gray-900 opacity-75"></div>
							</div>
							<span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>
							<div
								className="relative z-50 inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6"
								role="dialog"
								aria-modal="true"
								aria-labelledby="modal-headline"
							>
								<div>
									<div className="flex items-center justify-center w-14 h-14 mx-auto rounded-full">
										<svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeWidth="2" d="M12,17 L12,19 M12,10 L12,16 M12,3 L2,22 L22,22 L12,3 Z" />
										</svg>
									</div>
									<div className="mt-3 text-center sm:mt-5">
										<h3 className="text-lg font-medium leading-6 text-gray-100 ">Do you really want to create this {createNewFileDetails.type}?</h3>
										<div className="mt-2 text-gray-100">
											<p>The following {createNewFileDetails.type} would be created:</p>

											<input
												type="text"
												placeholder="Enter Name"
												className="bg-gray-900 input input-sm input-bordered input-primary w-full my-1 text-center"
												value={createNewFileDetails.name}
												onChange={e => {
													const name = e.target.value
													if (!name.includes("/")) {
														setCreateNewFileDetails({
															type: createNewFileDetails.type,
															path: `${createNewFileDetails.path.split("/").slice(0, -1).join("/")}/${name}`,
															name: name,
														})
													}
												}}
											/>
											<p className="text-sm">({createNewFileDetails.path.replace("/home/rdamn/", "~/")})</p>
										</div>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4 mt-5 sm:mt-6">
									<button
										type="button"
										onClick={() => setIsCreateFileModalOpen(false)}
										className="inline-flex justify-center w-full rounded-md border border-[transparent] shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 sm:text-sm"
									>
										Cancel
									</button>
									<button
										type="submit"
										onClick={() => {
											if (createNewFileDetails.type === "directory") {
												sendCrudSocketMessage(
													serializeCrudClientToServerEvent({
														command: "createFolder",
														newFolderPath: createNewFileDetails.path,
													}),
												)
											} else if (createNewFileDetails.type === "file") {
												sendCrudSocketMessage(
													serializeCrudClientToServerEvent({
														command: "createFile",
														newFilePath: createNewFileDetails.path,
													}),
												)
											}

											setIsCreateFileModalOpen(false)
											setCreateNewFileDetails(null)
										}}
										className="inline-flex justify-center w-full rounded-md border border-[transparent] shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:text-sm"
									>
										Create
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{isRenameFileModalOpen && selectedContextMenuFile && (
				<div className="bg-gray-900 h-[560px] relative z-[9999]">
					<div className="fixed inset-0 z-10 overflow-y-auto">
						<div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
							<div className="fixed inset-0 z-40 transition-opacity" aria-hidden="true">
								<div className="absolute inset-0 bg-gray-900 opacity-75"></div>
							</div>
							<span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>
							<div
								className="relative z-50 inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6"
								role="dialog"
								aria-modal="true"
								aria-labelledby="modal-headline"
							>
								<div>
									<div className="flex items-center justify-center w-14 h-14 mx-auto rounded-full">
										<svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeWidth="2" d="M12,17 L12,19 M12,10 L12,16 M12,3 L2,22 L22,22 L12,3 Z" />
										</svg>
									</div>
									<div className="mt-3 text-center sm:mt-5">
										<h3 className="text-lg font-medium leading-6 text-gray-100 ">Do you really want to rename this {selectedContextMenuFile.type}?</h3>
										<div className="mt-2 text-gray-100">
											<p>The following {selectedContextMenuFile.type} would be renamed:</p>

											<p className="font-bold underline" title={selectedContextMenuFile.path.replace("/home/rdamn/", "~/")}>
												{selectedContextMenuFile.name}
											</p>

											<p>to</p>

											<input
												type="text"
												placeholder="Enter New Name"
												className="bg-gray-900 input input-sm input-bordered input-primary w-full my-1 text-center"
												title={`${selectedContextMenuFile.path.replace("/home/rdamn/", "~/")}/${renameFileModalNewFileName}`}
												value={renameFileModalNewFileName}
												onChange={e => {
													const newFileName = e.target.value
													if (!newFileName.includes("/")) {
														setRenameFileModalNewFileName(newFileName)
													}
												}}
											/>
										</div>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4 mt-5 sm:mt-6">
									<button
										type="button"
										onClick={() => setIsRenameFileModalOpen(false)}
										className="inline-flex justify-center w-full rounded-md border border-[transparent] shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 sm:text-sm"
									>
										Cancel
									</button>
									<button
										type="submit"
										onClick={() => {
											sendCrudSocketMessage(
												serializeCrudClientToServerEvent({
													command: "move",
													oldPath: selectedContextMenuFile.path,
													newPath: `${selectedContextMenuFile.path.split("/").slice(0, -1).join("/")}/${renameFileModalNewFileName}`,
												}),
											)
											setIsRenameFileModalOpen(false)
											setSelectedContextMenuFile(null)
										}}
										className="inline-flex justify-center w-full rounded-md border border-[transparent] shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:text-sm"
									>
										Rename
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{isDeleteFileModalOpen && selectedContextMenuFile && (
				<div className="bg-gray-900 h-[560px] relative z-[9999]">
					<div className="fixed inset-0 z-10 overflow-y-auto">
						<div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
							<div className="fixed inset-0 z-40 transition-opacity" aria-hidden="true">
								<div className="absolute inset-0 bg-gray-900 opacity-75"></div>
							</div>
							<span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"></span>
							<div
								className="relative z-50 inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6"
								role="dialog"
								aria-modal="true"
								aria-labelledby="modal-headline"
							>
								<div>
									<div className="flex items-center justify-center w-14 h-14 mx-auto rounded-full">
										<svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeWidth="2" d="M12,17 L12,19 M12,10 L12,16 M12,3 L2,22 L22,22 L12,3 Z" />
										</svg>
									</div>
									<div className="mt-3 text-center sm:mt-5">
										<h3 className="text-lg font-medium leading-6 text-gray-100">Do you really want to delete this {selectedContextMenuFile.type}?</h3>
										<div className="mt-2 text-gray-100">
											<p>The following {selectedContextMenuFile.type} would be deleted:</p>

											<p className="font-bold underline" title={selectedContextMenuFile.path.replace("/home/rdamn/", "~/")}>
												{selectedContextMenuFile.name}
											</p>
										</div>
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4 mt-5 sm:mt-6">
									<button
										type="button"
										onClick={() => setIsDeleteFileModalOpen(false)}
										className="inline-flex justify-center w-full rounded-md border border-[transparent] shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 sm:text-sm"
									>
										Cancel
									</button>
									<button
										type="submit"
										onClick={() => {
											sendCrudSocketMessage(serializeCrudClientToServerEvent({ command: "delete", path: selectedContextMenuFile.path }))
											setIsDeleteFileModalOpen(false)
											setSelectedContextMenuFile(null)
										}}
										className="inline-flex justify-center w-full rounded-md border border-[transparent] shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:text-sm"
									>
										Delete
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default FileExplorer
