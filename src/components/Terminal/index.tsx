/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import "node_modules/xterm/css/xterm.css"

import { useEffect, useMemo, useRef } from "react"
import { Socket, io } from "socket.io-client"
import { Terminal as XTerminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { WebLinksAddon } from "xterm-addon-web-links"

/**
 * Shape of properties provided to the Terminal component
 *
 * @export
 */
export type TerminalPropsType = {
	url: string
	dimensions: {
		height: number
		width: number
	}
}

/**
 * A Terminal component to connect an xterm into a remote host through socket.io
 *
 * @export
 * @param {TerminalPropsType} props Properties provided to the Terminal component like the url of remote host
 * @return {JSX.Element}
 * @example
 * ```tsx
 * <Terminal url="http://localhost:1234" dimensions={{ height: 100, width: 200 }} />
 * ```
 */
const Terminal = (props: TerminalPropsType): JSX.Element => {
	const { url, dimensions } = props
	const { width, height } = dimensions

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

	interface ServerToClientEvents {
		ptyOut: (ptyOut: string) => void
	}

	interface ClientToServerEvents {
		ptyIn: (ptyIn: string) => void
	}

	const terminalSocket: Socket<ServerToClientEvents, ClientToServerEvents> = useMemo(() => io(url, { path: "/terminal" }), [url])

	useEffect(() => {
		if (terminalSocket) {
			xterm.onData(data => {
				terminalSocket.emit("ptyIn", data)
			})

			terminalSocket.on("ptyOut", msg => {
				xterm.write(msg)
			})

			terminalSocket.on("disconnect", () => {
				terminalSocket.connect()
			})
		}
	}, [terminalSocket, terminalSocket.connected, xterm])

	return <div ref={terminalRef} className="h-full w-full overflow-hidden scrollbar-hide"></div>
}

export default Terminal
