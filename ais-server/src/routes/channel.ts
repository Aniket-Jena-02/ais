import { Hono } from "hono";
import z, { email } from "zod/v4";
import { getCookie, setCookie } from "hono/cookie";
import { checkUserAuth } from "../utils.js";
import { ChannelModel } from "../models/channel-model.js";
import { MessageModel } from "../models/message-model.js";
import { UserModel } from "../models/user-model.js";

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

  const body = await c.req.parseBody();
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

  const messages = await MessageModel.find({
    channelId: id,
  })
    .populate("author", "name")
    .select({
      content: 1,
      createdAt: 1,
    });

  return c.json(messages);
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

  const messages = await MessageModel.find({
    channelId: id,
  })
    .populate("author", "name")
    .select({
      content: 1,
      createdAt: 1,
    });

  return c.json({
    channel,
    isAdmin: channel.admin && channel.admin.toString() === user.id.toString(),
    messages,
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

  if (selectedChannel.admin.toString() !== user.id) {
    c.status(400);
    return c.json({
      msg: "User not authorized to add members",
    });
  }

  const body = await c.req.parseBody();
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

export default channelRouter;
