import { Socket, Server as SocketIOServer } from "socket.io";
import { Server as BunEngine } from "@socket.io/bun-engine";
import { checkUserAuth } from "./utils.js";
import z from "zod/v4";
import { MessageModel } from "./models/message-model.js";

const io = new SocketIOServer({
  cors: {
    origin: "http://localhost:5173", // TODO: CHANGE THIS!!!
    credentials: true,
    methods: ["GET", "POST"],
  },
});

const engine = new BunEngine({
  path: "/socket.io/",
});
io.bind(engine);

io.use(
  async (
    socket: Socket<any, any, any, { user: { name: string; id: string } }>,
    next,
  ) => {
    const token = socket.handshake.headers.cookie?.split(";")[0].split("=")[1];
    const { isValid, user } = await checkUserAuth(token);
    if (!isValid || !user) {
      console.error("Invalid user");
      return;
    }

    socket.data.user = {
      id: user.id,
      name: user.name ?? "",
    };
    next();
  },
);

io.on("connection", async (socket) => {
  const { id, name } = socket.data.user;

  socket.on("join_channel", async (payload, callback) => {
    socket.join(payload.channelId);
    if (typeof callback === "function") {
      callback({
        status: "SUCCESS",
      });
    }
  });

  socket.on("chat_message", async (payload, callback) => {
    const schema = z.object({
      channelId: z.string(),
      content: z.string().min(1).max(1000),
    });
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      callback({
        status: "ERROR",
        error: "Invalid message",
      });
      return;
    }

    try {
      const newMsg = await MessageModel.create({
        author: id,
        ...parsed.data,
      })
      socket.to(parsed.data.channelId).emit("channel_message", {
        _id: newMsg.id,
        content: newMsg.content,
        createdAt: newMsg.createdAt.toISOString(),
        author: {
          _id: id,
          name,
        },
      });
      callback({
        status: "SUCCESS",
        messageId: newMsg.id,
      });
    } catch (err) {
      callback({
        status: "ERROR",
        error: "Failed to sync message to database",
      });
    }
  });

  socket.on("typing", async (payload) => {
    const schema = z.object({
      channelId: z.string(),
      isTyping: z.boolean(),
    });
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return;
    }

    console.log("Typing:", parsed.data);
    socket.to(parsed.data.channelId).emit("typing", {
      user: {
        id,
        name,
      },
      isTyping: parsed.data.isTyping,
    });
  })
});

export default engine;
