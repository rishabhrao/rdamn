/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import mongoose, { connect } from "mongoose"

let databaseConnection: Promise<typeof mongoose> | null = null

/**
 * A Helper Function to Connect mongoose to MongoDB
 * The database connection is stored globally to avoid creating new connections for every request
 *
 * @export
 * @returns {() => Promise<typeof mongoose>} A Promise that resolves when connected to MongoDB Successfully
 */
export const connectToDatabase: () => Promise<typeof mongoose> = async () => {
	if (databaseConnection === null) {
		databaseConnection = connect(process.env.MONGODB_URI || "", {
			serverSelectionTimeoutMS: 5000,
		}).then(() => mongoose)
		await databaseConnection
	}

	return databaseConnection
}
