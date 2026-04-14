import { Socket, Server as SocketIOServer } from "socket.io";
import { Server as BunEngine } from "@socket.io/bun-engine";
import { checkUserAuth } from "./utils.js";
import z from "zod/v4";
import { MessageModel } from "./models/message-model.js";
import { ChannelModel } from "./models/channel-model.js";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";

const frontendUrl = Bun.env.FRONTEND_URL || "http://localhost:5173";

interface AppSocketData {
  user: { name: string; id: string };
  joinedChannels: Set<string>;
}

// Only initialize Redis adapter when REDIS_URI is explicitly set.
// Cloud Run has no Redis sidecar — eagerly connecting would crash the container.
let redisAdapter;
if (Bun.env.REDIS_URI) {
  const pubClient = new Redis(Bun.env.REDIS_URI);
  const subClient = pubClient.duplicate();
  redisAdapter = createAdapter(pubClient, subClient);
  console.log("Redis adapter enabled for Socket.IO");
} else {
  console.log("No REDIS_URI set — running Socket.IO without Redis adapter");
}

export const io = new SocketIOServer({
  cors: {
    origin: frontendUrl,
    credentials: true,
    methods: ["GET", "POST"],
  },
  ...(redisAdapter && { adapter: redisAdapter }),
});

const engine = new BunEngine({
  path: "/socket.io/",
});
io.bind(engine);

io.use(
  async (
    socket: Socket<any, any, any, AppSocketData>,
    next,
  ) => {
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) {
      console.error("[socket] No cookies found on handshake");
      return next(new Error("UNAUTHORIZED: no cookies"));
    }

    // Parse cookies gracefully instead of reckless split chaining
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => {
        const [key, ...v] = c.split('=');
        return [key, v.join('=')];
      })
    );

    const token = cookies["user_auth"];
    if (!token) {
      console.error("[socket] No auth token found in cookie");
      return next(new Error("UNAUTHORIZED: missing auth token"));
    }

    const { isValid, user } = await checkUserAuth(token);
    if (!isValid || !user) {
      console.error("[socket] Invalid or expired auth token");
      return next(new Error("UNAUTHORIZED: invalid token"));
    }

    socket.data.user = {
      id: user.id,
      name: user.name ?? "",
    };
    socket.data.joinedChannels = new Set<string>();
    next();
  },
);

export const onlineUsersList = new Map<string, number>();

io.on("connection", async (socket) => {
  const { id, name } = socket.data.user;
  const wasOffline = !onlineUsersList.has(id);
  onlineUsersList.set(id, (onlineUsersList.get(id) || 0) + 1);

  // Notify all channels this user belongs to that they've come online
  if (wasOffline) {
    const userChannels = await ChannelModel.find({ members: id }).select({ _id: 1 });
    for (const ch of userChannels) {
      io.to(ch._id.toString()).emit("user_presence", { userId: id, status: "online" });
    }
  }

  socket.on("disconnect", async () => {
    const count = onlineUsersList.get(id) || 0;
    if (count > 1) {
      onlineUsersList.set(id, count - 1);
    } else {
      onlineUsersList.delete(id);
      // Notify all channels this user belongs to that they've gone offline
      const userChannels = await ChannelModel.find({ members: id }).select({ _id: 1 });
      for (const ch of userChannels) {
        io.to(ch._id.toString()).emit("user_presence", { userId: id, status: "offline" });
      }
    }
  });

  socket.on("join_channel", async (payload, callback) => {
    const schema = z.object({
      channelId: z.string(),
    });
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      if (typeof callback === "function") {
        callback({
          status: "ERROR",
          error: "Invalid channel",
        });
      }
      return;
    }

    const isMember = await ChannelModel.exists({
      _id: parsed.data.channelId,
      members: id,
    });
    if (!isMember) {
      if (typeof callback === "function") {
        callback({
          status: "ERROR",
          error: "UNAUTHORIZED",
        });
      }
      return;
    }

    socket.join(parsed.data.channelId);
    socket.data.joinedChannels.add(parsed.data.channelId);
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
      replyTo: z.string().optional(),
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
        channelId: parsed.data.channelId,
        content: parsed.data.content,
        replyTo: parsed.data.replyTo || null,
      })

      // Populate replyTo for the broadcast
      let replyToData = null;
      if (newMsg.replyTo) {
        const parentMsg = await MessageModel.findById(newMsg.replyTo)
          .populate("author", "name")
          .select("content author");
        if (parentMsg) {
          replyToData = {
            _id: parentMsg._id,
            content: parentMsg.content,
            author: parentMsg.author,
          };
        }
      }

      socket.to(parsed.data.channelId).emit("channel_message", {
        _id: newMsg.id,
        content: newMsg.content,
        createdAt: newMsg.createdAt.toISOString(),
        author: {
          _id: id,
          name,
        },
        replyTo: replyToData,
      });
      callback({
        status: "SUCCESS",
        messageId: newMsg.id,
        replyTo: replyToData,
      });
    } catch (err) {
      callback({
        status: "ERROR",
        error: "Failed to sync message to database",
      });
    }
  });

  socket.on("react_message", async (payload) => {
    const schema = z.object({
      messageId: z.string(),
      emoji: z.string().min(1).max(10),
      channelId: z.string(),
    });
    const parsed = schema.safeParse(payload);
    if (!parsed.success) return;

    const { messageId, emoji, channelId } = parsed.data;

    try {
      const isMember = await ChannelModel.exists({
        _id: channelId,
        members: id,
      });
      if (!isMember) return;

      if (!socket.data.joinedChannels.has(channelId)) {
        socket.join(channelId);
        socket.data.joinedChannels.add(channelId);
      }

      const message = await MessageModel.findOne({
        _id: messageId,
        channelId,
      }).select("reactions");
      if (!message) return;

      const existingReaction = message.reactions?.find((reaction: any) => reaction.emoji === emoji);

      if (existingReaction) {
        const userIndex = existingReaction.users.findIndex(
          (user: any) => user.toString() === id.toString()
        );

        if (userIndex > -1) {
          existingReaction.users.splice(userIndex, 1);
          if (existingReaction.users.length === 0) {
            message.reactions = message.reactions?.filter(
              (reaction: any) => reaction.emoji !== emoji
            ) as any;
          }
        } else {
          existingReaction.users.push(id as any);
        }
      } else {
        message.reactions = message.reactions || ([] as any);
        (message.reactions as any[]).push({ emoji, users: [id] });
      }

      await message.save();

      // Broadcast canonical state to the whole room so optimistic clients reconcile.
      io.to(channelId).emit("message_reaction", {
        messageId,
        reactions: message.reactions || [],
      });
    } catch (err) {
      console.error("react_message error:", err);
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
