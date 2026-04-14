import { Hono } from 'hono'
import mongoose from 'mongoose'
import authRouter from './routes/auth.js'
import channelRouter from './routes/channel.js'
import engine from './sockets.js'
import { cors } from 'hono/cors'

try {
  await mongoose.connect(Bun.env.MONGO_URI!)
  console.log("MongoDB connected")
} catch (error) {
  console.error("Failed to connect to MongoDB", error)
  process.exit(1)
}


const app = new Hono()

const frontendUrl = Bun.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: frontendUrl,
  credentials: true
}))

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/healthz', (c) => {
  if (mongoose.connection.readyState !== 1) {
    c.status(503)
    return c.text('mongo not ready')
  }
  return c.text('ok')
})

app.route('/auth', authRouter)
app.route('/channels', channelRouter)

const { websocket } = engine.handler()
export default {
  port: Bun.env.PORT || 3000,
  // hostname: "0.0.0.0",
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
