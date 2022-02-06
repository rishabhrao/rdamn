/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import mongoose, { connect } from "mongoose"

/**
 * A Helper Function to Connect to MongoDB
 *
 * @export
 * @returns {() => Promise<typeof mongoose>} A Promise that resolves when connected to MongoDB Successfully
 */
export const connectToDatabase: () => Promise<typeof mongoose> = () =>
	connect(process.env.MONGODB_URI || "", {
		keepAlive: false,
	})
