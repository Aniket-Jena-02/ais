import { Hono } from 'hono'
import mongoose from 'mongoose'
import authRouter from './routes/auth.js'
import channelRouter from './routes/channel.js'
import engine from './sockets.js'
import { cors } from 'hono/cors'

(async () => {
  await mongoose.connect(Bun.env.MONGO_URI!)
  console.log("MongoDB connected")
})()


const app = new Hono()

const frontendUrl = Bun.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: frontendUrl,
  credentials: true
}))

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/auth', authRouter)
app.route('/channels', channelRouter)

const { websocket } = engine.handler()
export default {
  port: Bun.env.PORT || 3000,
  hostname: "0.0.0.0",
  idleTimeout: 30,
  fetch: (req: Request, server: any) => {
    const url = new URL(req.url)
    if (url.pathname.startsWith('/socket.io/')) {
      return engine.handleRequest(req, server)
    }
    return app.fetch(req, server)
  },
  websocket,
}
