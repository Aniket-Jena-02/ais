import { Hono } from "hono";
import z from "zod/v4";
import { UserModel } from "../models/user-model.js";
import { sign } from "hono/jwt";
import { getCookie, setCookie } from "hono/cookie";
import { checkUserAuth } from "../utils.js";

const authRouter = new Hono();

authRouter.post("/register", async (c) => {
  const body = await c.req.json();
  const schema = z.object({
    name: z.string().min(3),
    email: z.email(),
    password: z.string().min(6).max(20),
  });

  const result = schema.safeParse(body);

  if (!result.success) {
    c.status(400);
    return c.json({
      msg: "Malformed input",
    });
  }

  const isExisting = await UserModel.findOne({
    email: result.data.email,
  });

  if (isExisting) {
    c.status(400);
    return c.json({
      msg: "User already exists",
    });
  }

  const hashedPassword = await Bun.password.hash(result.data.password);
  const user = await UserModel.create({
    ...result.data,
    password: hashedPassword,
  });

  const token = await sign({ user_id: user.id }, Bun.env.JWT_SECRET!, "HS256");
  setCookie(c, "user_auth", token, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    sameSite: "lax",
  });

  return c.json({
    msg: "User created and logged in successfully",
  });
});

authRouter.post("/login", async (c) => {
  const body = await c.req.json();
  const schema = z.object({
    email: z.email(),
    password: z.string(),
  });

  const result = schema.safeParse(body);

  if (!result.success) {
    c.status(400);
    return c.json({
      msg: "Malformed input",
    });
  }

  const user = await UserModel.findOne({
    email: result.data.email,
  });

  if (!user) {
    c.status(400);
    return c.json({
      msg: "User not found",
    });
  }

  const isValidPassword = await Bun.password.verify(
    result.data.password,
    user.password!,
  );
  if (!isValidPassword) {
    c.status(400);
    return c.json({
      msg: "Invalid credentials",
    });
  }

  const token = await sign({ user_id: user.id }, Bun.env.JWT_SECRET!, "HS256");
  setCookie(c, "user_auth", token, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    sameSite: "lax",
  });

  return c.json({
    msg: "Logged in successfully",
  });
});

authRouter.get("/me", async (c) => {
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

  return c.json({
    userName: user.name,
    userId: user._id
  });
});

export default authRouter;
