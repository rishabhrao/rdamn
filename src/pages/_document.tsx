/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import Document, { DocumentContext, DocumentInitialProps, Head, Html, Main, NextScript } from "next/document"

class CustomDocument extends Document {
	static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
		return await Document.getInitialProps(ctx)
	}

	render() {
		return (
			<Html lang="en">
				<Head />

				<Main />
				<NextScript />
			</Html>
		)
	}
}

export default CustomDocument
