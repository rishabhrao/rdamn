/* Copyright (c) rishabhrao (https://github.com/rishabhrao) */

import Redis from "ioredis"

declare global {
	// eslint-disable-next-line no-var
	var redis: Redis.Redis | undefined
}

/**
 * A redis db instance
 *
 * @export
 * @returns {Redis.Redis} ioredis client instance
 * @example
 * Set value of key:
 * ```ts
 * await redis.set("key", "val")
 * ```
 * @example
 * Get value of key:
 * ```ts
 * const myVal = await redis.get("key")
 * ```
 */
export const redis: Redis.Redis =
	global.redis ||
	new Redis(process.env.REDIS_URL, {
		connectTimeout: 60000,
	})

if (process.env.NODE_ENV !== "production") {
	global.redis = redis
}
