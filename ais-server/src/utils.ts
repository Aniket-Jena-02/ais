import * as amqp from "amqplib"
import { decode, verify } from "hono/jwt";
import { UserModel } from "./models/user-model.js";
import { MessageModel } from "./models/message-model.js";

export const checkUserAuth = async (token: string | undefined) => {
    const isVerifiedToken = await verify(token ?? "", Bun.env.JWT_SECRET!, 'HS256')

    if (!isVerifiedToken) {
        return {
            isValid: false,
            user: null
        }
    }

    const decodedToken = decode(token ?? "")
    let user
    try {
        user = await UserModel.findById(decodedToken.payload.user_id)
    } catch (err) {
        console.error(err)
    }

    if (!user) {
        return {
            isValid: false,
            user: null
        }
    }

    return {
        isValid: true,
        user
    }
}

export const startRabbitWorker = async () => {
    const BATCH_SIZE = 500
    const FLUSH_INTERVAL_MS = 3000

    const mqConnection = await amqp.connect('amqp://localhost')
    const mqChannel = await mqConnection.createChannel()
    await mqChannel.assertQueue('mongo_write_queue', { durable: true })
    mqChannel.prefetch(BATCH_SIZE)

    let messageBatch: any[] = []
    let unackedMessages: amqp.ConsumeMessage[] = []

    const flushToMongoDB = async () => {
        if (messageBatch.length === 0) return
        const batchToInsert = [...messageBatch]
        const messagesToAck = [...unackedMessages]

        messageBatch = []
        unackedMessages = []

        try {
            await MessageModel.insertMany(batchToInsert)
            messagesToAck.forEach(m => mqChannel.ack(m))
        } catch (error) {
            console.error(error)
            messagesToAck.forEach(m => mqChannel.nack(m))
        }
    }

    setInterval(() => {
        flushToMongoDB()
    }, FLUSH_INTERVAL_MS)

    mqChannel.consume('mongo_write_queue', (msg) => {
        if (msg !== null) {
            messageBatch.push(JSON.parse(msg.content.toString()))
            unackedMessages.push(msg)

            if (messageBatch.length >= BATCH_SIZE) {
                flushToMongoDB()
            }
        }
    })
}