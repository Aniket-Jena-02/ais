import { Hono } from "hono";
import z from "zod/v4";
import { authMiddleware, type AuthEnv } from "../middleware/auth.js";
import { ChannelModel } from "../models/channel-model.js";
import { LastReadModel } from "../models/last-read-model.js";
import { MessageModel } from "../models/message-model.js";
import { UserModel } from "../models/user-model.js";
import { onlineUsersList, io } from "../sockets.js";

const channelRouter = new Hono<AuthEnv>();

const upsertLastRead = async (userId: string, channelId: string, messageId?: string | null) => {
  if (!messageId) return null;

  await LastReadModel.findOneAndUpdate(
    {
      userId,
      channelId,
    },
    {
      lastReadMessageId: messageId,
      lastReadAt: new Date(),
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  return messageId;
};

// Apply auth middleware to all channel routes
channelRouter.use("*", authMiddleware);

channelRouter.post("/create-channel", async (c) => {
  const user = c.get("user");

  const body = await c.req.json();
  const schema = z.object({
    name: z.string().min(3).max(20),
  });

  const result = schema.safeParse(body);

  if (!result.success) {
    c.status(400);
    return c.json({
      msg: "Malformed input",
    });
  }

  const channel = await ChannelModel.create({
    name: result.data.name,
    admin: user.id,
    members: [user.id],
  });

  return c.json({
    msg: "Channel created",
    channelId: channel._id,
  });
});

channelRouter.get("/user", async (c) => {
  const user = c.get("user");

  const channels = await ChannelModel.find({
    members: user.id,
  }).select({
    name: 1,
    createdAt: 1,
  }).lean();

  const channelIds = channels.map((channel) => channel._id);
  const lastReads = channelIds.length > 0
    ? await LastReadModel.find({
      userId: user.id,
      channelId: { $in: channelIds },
    }).select({
      channelId: 1,
      lastReadMessageId: 1,
    }).lean()
    : [];

  const lastReadByChannel = new Map(
    lastReads.map((lastRead) => [
      lastRead.channelId.toString(),
      lastRead.lastReadMessageId?.toString() ?? null,
    ])
  );

  const channelsWithUnreadCount = await Promise.all(
    channels.map(async (channel) => {
      const lastReadMessageId = lastReadByChannel.get(channel._id.toString());
      const unreadCount = await MessageModel.countDocuments({
        channelId: channel._id,
        ...(lastReadMessageId ? { _id: { $gt: lastReadMessageId } } : {}),
      });

      return {
        ...channel,
        unreadCount,
      };
    })
  );

  return c.json(channelsWithUnreadCount);
});

channelRouter.get("/:id/messages", async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();
  const before = c.req.query("before");
  const limit = Math.min(parseInt(c.req.query("limit") || "50", 10), 100);

  const isMember = await ChannelModel.exists({
    _id: id,
    members: user.id,
  });
  if (!isMember) {
    c.status(403);
    return c.json({
      msg: "User not authorized to view this channel",
    });
  }

  const query: Record<string, any> = { channelId: id };
  if (before) {
    query._id = { $lt: before };
  }

  const messages = await MessageModel.find(query)
    .sort({ _id: -1 })
    .limit(limit)
    .populate("author", "name")
    .populate({
      path: "replyTo",
      select: "content author",
      populate: { path: "author", select: "name" },
    })
    .select({
      content: 1,
      createdAt: 1,
      updatedAt: 1,
      reactions: 1,
      replyTo: 1,
    });

  // Return in chronological order
  messages.reverse();

  if (!before && messages.length > 0) {
    const latestVisibleMessage = messages[messages.length - 1];
    await upsertLastRead(user.id.toString(), id, latestVisibleMessage._id.toString());
  }

  return c.json({
    messages,
    hasMore: messages.length === limit,
  });
});

channelRouter.get("/:id", async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();

  const isMember = await ChannelModel.exists({
    _id: id,
    members: user.id,
  });
  if (!isMember) {
    c.status(403);
    return c.json({
      msg: "User not authorized to view this channel",
    });
  }

  const channel = await ChannelModel.findById(id)
    .populate("members", "name")
    .select({
      name: 1,
      createdAt: 1,
      admin: 1,
    });

  if (!channel) {
    c.status(404);
    return c.json({
      msg: "Channel not found",
    });
  }

  return c.json({
    channel,
    isAdmin: channel.admin && channel.admin?.toString() === user.id.toString(),
  });
});

channelRouter.post("/:id/read", async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();

  const isMember = await ChannelModel.exists({
    _id: id,
    members: user.id,
  });
  if (!isMember) {
    c.status(403);
    return c.json({
      msg: "User not authorized to view this channel",
    });
  }

  const body = await c.req.json().catch(() => ({}));
  const schema = z.object({
    messageId: z.string().optional(),
  });
  const result = schema.safeParse(body);

  if (!result.success) {
    c.status(400);
    return c.json({
      msg: "Malformed input",
    });
  }

  let messageId = result.data.messageId;
  if (messageId) {
    const messageExists = await MessageModel.exists({
      _id: messageId,
      channelId: id,
    });
    if (!messageExists) {
      c.status(404);
      return c.json({
        msg: "Message not found",
      });
    }
  } else {
    const latestMessage = await MessageModel.findOne({ channelId: id })
      .sort({ _id: -1 })
      .select({ _id: 1 })
      .lean();

    messageId = latestMessage?._id?.toString();
  }

  await upsertLastRead(user.id.toString(), id, messageId);

  return c.json({
    msg: "Channel marked as read",
    lastReadMessageId: messageId ?? null,
  });
});

channelRouter.post("/:id/add-member", async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();

  const selectedChannel = await ChannelModel.findById(id);

  if (!selectedChannel) {
    c.status(404);
    return c.json({
      msg: "Channel not found",
    });
  }

  if (selectedChannel.admin?.toString() !== user.id.toString()) {
    c.status(403);
    return c.json({
      msg: "User not authorized to add members",
    });
  }

  const body = await c.req.json();
  const schema = z.object({
    email: z.email(),
  });

  const result = schema.safeParse(body);

  if (!result.success) {
    c.status(400);
    return c.json({
      msg: "Malformed input",
    });
  }

  const userToAdd = await UserModel.findOne({
    email: result.data.email,
  });

  if (!userToAdd) {
    c.status(404);
    return c.json({
      msg: "User not found",
    });
  }

  if (selectedChannel.members.includes(userToAdd._id)) {
    c.status(400);
    return c.json({
      msg: "User already a member",
    });
  }

  selectedChannel.members.push(userToAdd._id);
  await selectedChannel.save();

  return c.json({
    msg: "User added to channel",
  });
});

channelRouter.get("/:id/members", async (c) => {
  const { id } = c.req.param();

  const channel = await ChannelModel.findById(id)
    .populate("members", "name")
    .select({
      members: 1,
      admin: 1,
    });

  if (!channel) {
    c.status(404);
    return c.json({
      msg: "Channel not found",
    });
  }

  const formattedMembers = channel.members.map((member: any) => ({
    _id: member._id,
    name: member.name,
    status: onlineUsersList.has(member._id.toString()) ? "online" : "offline",
    role: channel.admin?.toString() === member._id.toString() ? "admin" : "member"
  }));

  // Sort: online first, then alphabetical
  formattedMembers.sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "online" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  return c.json(formattedMembers);
});

channelRouter.patch("/messages/:msgId", async (c) => {
  const user = c.get("user");
  const { msgId } = c.req.param();

  const message = await MessageModel.findById(msgId);

  if (!message) {
    c.status(404);
    return c.json({
      msg: "Message not found",
    });
  }

  if (message.author?.toString() !== user.id.toString()) {
    c.status(403);
    return c.json({
      msg: "User not authorized to edit this message",
    });
  }

  // Enforce 15-minute edit window
  const EDIT_WINDOW_MS = 15 * 60 * 1000;
  const elapsed = Date.now() - new Date(message.createdAt).getTime();
  if (elapsed > EDIT_WINDOW_MS) {
    c.status(403);
    return c.json({
      msg: "Message can no longer be edited — edit window has expired",
    });
  }

  const body = await c.req.json();
  const schema = z.object({
    content: z.string().min(1).max(1000),
  });

  const result = schema.safeParse(body);

  if (!result.success) {
    c.status(400);
    return c.json({
      msg: "Malformed input",
    });
  }

  message.content = result.data.content;
  await message.save();

  // Broadcast to all channel members in real-time
  if (message.channelId) {
    io.to(message.channelId.toString()).emit("message_edited", {
      messageId: msgId,
      content: message.content,
      updatedAt: message.updatedAt,
    });
  }

  return c.json({
    msg: "Message edited successfully",
    content: message.content,
    updatedAt: message.updatedAt,
  });
})

channelRouter.delete("/messages/:msgId", async (c) => {
  const user = c.get("user");
  const { msgId } = c.req.param();

  const message = await MessageModel.findById(msgId);

  if (!message) {
    c.status(404);
    return c.json({
      msg: "Message not found",
    });
  }

  const channel = await ChannelModel.findById(message.channelId);

  if (!channel) {
    c.status(404);
    return c.json({
      msg: "Channel not found",
    });
  }

  const isChannelAdmin = channel.admin?.toString() === user.id.toString();

  if (message.author?.toString() !== user.id.toString() && !isChannelAdmin) {
    c.status(403);
    return c.json({
      msg: "User not authorized to delete this message",
    });
  }

  await message.deleteOne();

  // Broadcast deletion to all channel members in real-time
  if (message.channelId) {
    io.to(message.channelId.toString()).emit("message_deleted", {
      messageId: msgId,
    });
  }

  return c.json({
    msg: "Message deleted successfully",
  });
});

// Leave channel (non-admin self-leave)
channelRouter.post("/:id/leave", async (c) => {
  const user = c.get("user");
  const { id } = c.req.param();

  const channel = await ChannelModel.findById(id);
  if (!channel) {
    c.status(404);
    return c.json({ msg: "Channel not found" });
  }

  if (channel.admin?.toString() === user.id.toString()) {
    c.status(400);
    return c.json({ msg: "Channel admin cannot leave. Transfer ownership or delete the channel." });
  }

  const isMember = channel.members.some((m: any) => m.toString() === user.id.toString());
  if (!isMember) {
    c.status(400);
    return c.json({ msg: "You are not a member of this channel" });
  }

  channel.members = channel.members.filter((m: any) => m.toString() !== user.id.toString()) as any;
  await channel.save();
  await LastReadModel.deleteOne({ userId: user.id, channelId: id });

  return c.json({ msg: "Left channel successfully" });
});

// Remove member from channel (admin only)
channelRouter.delete("/:id/members/:userId", async (c) => {
  const user = c.get("user");
  const { id, userId } = c.req.param();

  const channel = await ChannelModel.findById(id);
  if (!channel) {
    c.status(404);
    return c.json({ msg: "Channel not found" });
  }

  if (channel.admin?.toString() !== user.id.toString()) {
    c.status(403);
    return c.json({ msg: "Only the channel admin can remove members" });
  }

  if (userId === user.id.toString()) {
    c.status(400);
    return c.json({ msg: "Admin cannot remove themselves" });
  }

  const isMember = channel.members.some((m: any) => m.toString() === userId);
  if (!isMember) {
    c.status(404);
    return c.json({ msg: "User is not a member of this channel" });
  }

  channel.members = channel.members.filter((m: any) => m.toString() !== userId) as any;
  await channel.save();
  await LastReadModel.deleteOne({ userId, channelId: id });

  // Notify the kicked user via socket if they're online
  io.to(id).emit("member_removed", { userId });

  return c.json({ msg: "Member removed successfully" });
});

channelRouter.post("/messages/:msgId/react", async (c) => {
  const user = c.get("user");
  const { msgId } = c.req.param();

  const body = await c.req.json();
  const schema = z.object({
    emoji: z.string().min(1).max(10),
  });

  const result = schema.safeParse(body);
  if (!result.success) {
    c.status(400);
    return c.json({ msg: "Malformed input" });
  }

  const message = await MessageModel.findById(msgId);
  if (!message) {
    c.status(404);
    return c.json({ msg: "Message not found" });
  }

  const { emoji } = result.data;
  const existingReaction = message.reactions?.find((r: any) => r.emoji === emoji);

  if (existingReaction) {
    const userIndex = existingReaction.users.findIndex(
      (u: any) => u.toString() === user.id.toString()
    );
    if (userIndex > -1) {
      // Remove user's reaction
      existingReaction.users.splice(userIndex, 1);
      // Remove the reaction entry entirely if no users left
      if (existingReaction.users.length === 0) {
        message.reactions = message.reactions?.filter(
          (r: any) => r.emoji !== emoji
        ) as any;
      }
    } else {
      // Add user to existing reaction
      existingReaction.users.push(user.id as any);
    }
  } else {
    // Create new reaction
    message.reactions = message.reactions || ([] as any);
    (message.reactions as any[]).push({ emoji, users: [user.id] });
  }

  await message.save();

  // Broadcast to channel
  if (message.channelId) {
    io.to(message.channelId.toString()).emit("message_reaction", {
      messageId: msgId,
      reactions: message.reactions,
    });
  }

  return c.json({
    msg: "Reaction updated",
    reactions: message.reactions,
  });
});

export default channelRouter;
