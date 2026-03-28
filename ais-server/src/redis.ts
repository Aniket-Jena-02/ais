import { Redis } from "ioredis"

// Only create a Redis client when REDIS_URI is explicitly configured.
// Prevents crash on environments without Redis (e.g. Cloud Run).
export const redis = Bun.env.REDIS_URI ? new Redis(Bun.env.REDIS_URI) : null
