import { Hono } from "hono";
import z, { email } from "zod/v4";
import { getCookie, setCookie } from "hono/cookie";
import { checkUserAuth } from "../utils.js";
import { ChannelModel } from "../models/channel-model.js";
import { MessageModel } from "../models/message-model.js";
import { UserModel } from "../models/user-model.js";
import { onlineUsersList } from "../sockets.js";

const channelRouter = new Hono();

channelRouter.post("/create-channel", async (c) => {
  const token = getCookie(c, "user_auth");
  const { isValid, user } = await checkUserAuth(token);

  if (!isValid) {
    c.status(400);
    return c.json({
      msg: "Invalid token",
    });
  }

  if (!user) {
    c.status(400);
    return c.json({
      msg: "User not found",
    });
  }

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
  });
});

channelRouter.get("/user", async (c) => {
  const token = getCookie(c, "user_auth");
  const { isValid, user } = await checkUserAuth(token);

  if (!isValid) {
    c.status(400);
    return c.json({
      msg: "Invalid token",
    });
  }

  if (!user) {
    c.status(400);
    return c.json({
      msg: "User not found",
    });
  }

  const channels = await ChannelModel.find({
    members: user.id,
  }).select({
    name: 1,
    createdAt: 1,
  });

  return c.json(channels);
});

channelRouter.get("/:id/messages", async (c) => {
  const token = getCookie(c, "user_auth");
  const { isValid, user } = await checkUserAuth(token);

  if (!isValid) {
    c.status(400);
    return c.json({
      msg: "Invalid token",
    });
  }

  if (!user) {
    c.status(400);
    return c.json({
      msg: "User not found",
    });
  }

  const { id } = c.req.param();
  const before = c.req.query("before");
  const limit = Math.min(parseInt(c.req.query("limit") || "50", 10), 100);

  const query: Record<string, any> = { channelId: id };
  if (before) {
    query._id = { $lt: before };
  }

  const messages = await MessageModel.find(query)
    .sort({ _id: -1 })
    .limit(limit)
    .populate("author", "name")
    .select({
      content: 1,
      createdAt: 1,
    });

  // Return in chronological order
  messages.reverse();

  return c.json({
    messages,
    hasMore: messages.length === limit,
  });
});

channelRouter.get("/:id", async (c) => {
  const token = getCookie(c, "user_auth");
  const { isValid, user } = await checkUserAuth(token);

  if (!isValid) {
    c.status(400);
    return c.json({
      msg: "Invalid token",
    });
  }

  if (!user) {
    c.status(400);
    return c.json({
      msg: "User not found",
    });
  }

  const { id } = c.req.param();

  const channel = await ChannelModel.findById(id)
    .populate("members", "name")
    .select({
      name: 1,
      createdAt: 1,
      admin: 1,
    });

  if (!channel) {
    c.status(400);
    return c.json({
      msg: "Channel not found",
    });
  }

  return c.json({
    channel,
    isAdmin: channel.admin && channel.admin?.toString() === user.id.toString(),
  });
});

channelRouter.post("/:id/add-member", async (c) => {
  const token = getCookie(c, "user_auth");
  const { isValid, user } = await checkUserAuth(token);

  if (!isValid) {
    c.status(400);
    return c.json({
      msg: "Invalid token",
    });
  }

  if (!user) {
    c.status(400);
    return c.json({
      msg: "User not found",
    });
  }

  const { id } = c.req.param();

  const selectedChannel = await ChannelModel.findById(id);

  if (!selectedChannel) {
    c.status(400);
    return c.json({
      msg: "Channel not found",
    });
  }

  if (selectedChannel.admin?.toString() !== user.id.toString()) {
    c.status(400);
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
    c.status(400);
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
})

channelRouter.get("/:id/members", async (c) => {
  const token = getCookie(c, "user_auth");
  const { isValid, user } = await checkUserAuth(token);

  if (!isValid) {
    c.status(400);
    return c.json({
      msg: "Invalid token",
    });
  }

  if (!user) {
    c.status(400);
    return c.json({
      msg: "User not found",
    });
  }

  const { id } = c.req.param();

  const channel = await ChannelModel.findById(id)
    .populate("members", "name")
    .select({
      members: 1,
      admin: 1,
    });

  if (!channel) {
    c.status(400);
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
})

export default channelRouter;
