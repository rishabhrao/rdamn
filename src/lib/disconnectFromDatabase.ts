/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import { disconnect } from "mongoose"

/**
 * A Helper Function to Disconnect from MongoDB
 *
 * @export
 * @returns {() => Promise<void>} A Promise that resolves when disconnected from MongoDB Successfully
 */
export const disconnectFromDatabase: () => Promise<void> = () => disconnect()
