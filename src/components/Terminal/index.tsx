/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import "node_modules/xterm/css/xterm.css"

import { EOL } from "os"

import AjvJtd, { JTDSchemaType } from "ajv/dist/jtd"
import { Dispatch, SetStateAction, useEffect, useMemo, useRef } from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"
import { Terminal as XTerminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { WebLinksAddon } from "xterm-addon-web-links"

/**
 * Shape of properties provided to the Terminal component
 *
 * @export
 */
export type TerminalPropsType = {
	socketUrl: string
	dimensions: {
		height: number
		width: number
	}
	setIsPlaygroundUp: Dispatch<SetStateAction<boolean>>
}

/**
 * A Terminal component to connect an xterm into a remote host through socket.io
 *
 * @export
 * @param {TerminalPropsType} props Properties provided to the Terminal component like the url of remote socket where tty is running
 * @return {JSX.Element}
 * @example
 * ```tsx
 * <Terminal url="http://localhost:1234" dimensions={{ height: 100, width: 200 }} />
 * ```
 */
const Terminal = (props: TerminalPropsType): JSX.Element => {
	const { socketUrl, dimensions, setIsPlaygroundUp } = props
	const { width, height } = dimensions

	// Refer https://gist.github.com/abritinthebay/d80eb99b2726c83feb0d97eab95206c4
	const reset = "\x1b[0m"
	const bright = "\x1b[1m"
	const red = "\x1b[31m"
	const BgWhite = "\x1b[47m"

	const terminalRef = useRef(null)

	const xterm: XTerminal = useMemo(() => new XTerminal({ convertEol: true, cursorBlink: true }), [])
	const fitAddon: FitAddon = useMemo(() => new FitAddon(), [])

	useEffect(() => {
		setTimeout(() => {
			fitAddon.fit()
		}, 500)
	}, [width, height, fitAddon])

	useEffect(() => {
		xterm.loadAddon(fitAddon)
		fitAddon.fit()

		xterm.loadAddon(new WebLinksAddon())

		if (terminalRef.current) {
			xterm.open(terminalRef.current)
		}
	}, [xterm, terminalRef, fitAddon])

	const ajvJtd = useMemo(() => new AjvJtd(), [])

	type PtyInTerminalClientToServerEventType = {
		type: "ptyIn"
		ptyIn: string
	}

	const PtyInTerminalClientToServerEventSchema: JTDSchemaType<Omit<PtyInTerminalClientToServerEventType, "type">> = useMemo(
		() => ({
			properties: {
				ptyIn: { type: "string" },
			},
			additionalProperties: false,
		}),
		[],
	)

	type StartPreviewTerminalClientToServerEventType = {
		type: "startPreview"
		shouldStartPreview: boolean
	}

	const StartPreviewTerminalClientToServerEventSchema: JTDSchemaType<Omit<StartPreviewTerminalClientToServerEventType, "type">> = useMemo(
		() => ({
			properties: {
				shouldStartPreview: { type: "boolean" },
			},
			additionalProperties: false,
		}),
		[],
	)

	type TerminalClientToServerEventType = PtyInTerminalClientToServerEventType | StartPreviewTerminalClientToServerEventType

	const TerminalClientToServerEventSchema: JTDSchemaType<TerminalClientToServerEventType> = useMemo(
		() => ({
			discriminator: "type",
			mapping: {
				ptyIn: PtyInTerminalClientToServerEventSchema,
				startPreview: StartPreviewTerminalClientToServerEventSchema,
			},
		}),
		[PtyInTerminalClientToServerEventSchema, StartPreviewTerminalClientToServerEventSchema],
	)

	const serializeTerminalClientToServerEvent = useMemo(() => ajvJtd.compileSerializer(TerminalClientToServerEventSchema), [TerminalClientToServerEventSchema, ajvJtd])

	type TerminalServerToClientEventType = {
		ptyOut: string
	}

	const TerminalServerToClientEventSchema: JTDSchemaType<TerminalServerToClientEventType> = useMemo(
		() => ({
			properties: {
				ptyOut: { type: "string" },
			},
			additionalProperties: false,
		}),
		[],
	)

	const parseTerminalServerToClientEvent = useMemo(() => ajvJtd.compileParser(TerminalServerToClientEventSchema), [TerminalServerToClientEventSchema, ajvJtd])

	const { sendMessage: sendSocketMessage, readyState: socketState } = useWebSocket(socketUrl, {
		retryOnError: true,
		shouldReconnect: () => true,
		reconnectAttempts: 999999,
		reconnectInterval: 3000,
		onOpen: () => {
			setIsPlaygroundUp(true)
			setTimeout(() => {
				sendSocketMessage(serializeTerminalClientToServerEvent({ type: "startPreview", shouldStartPreview: true }))
			}, 1000)
		},
		onMessage: message => {
			const parsedMessage = parseTerminalServerToClientEvent(message.data as string)
			if (parsedMessage) {
				xterm.write(parsedMessage.ptyOut)
			}
		},
	})

	useEffect(() => {
		if (socketState === ReadyState.UNINSTANTIATED || socketState === ReadyState.CONNECTING) {
			let buffer = ""
			for (let lineNum = 0; lineNum <= xterm.buffer.active.length; lineNum++) {
				buffer += xterm.buffer.active.getLine(lineNum)?.translateToString() || ""
			}
			if (!buffer.trim().endsWith("Connecting to Server... Please Wait...")) {
				xterm.write(`${EOL}${EOL}${BgWhite}${bright}${red}Connecting to Server... Please Wait...${reset}${EOL}`)
			}
		}
	}, [socketState, xterm])

	useEffect(() => {
		xterm.onData(data => {
			sendSocketMessage(serializeTerminalClientToServerEvent({ type: "ptyIn", ptyIn: data }))
		})
	}, [sendSocketMessage, serializeTerminalClientToServerEvent, xterm])

	return <div ref={terminalRef} className="w-full h-full overflow-hidden scrollbar-hide"></div>
}

export default Terminal
