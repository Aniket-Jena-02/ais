import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { checkUserAuth } from "../utils.js";

export type AuthEnv = {
  Variables: {
    user: { id: string; name: string };
  };
};

/**
 * Auth middleware — extracts user_auth cookie, validates the JWT,
 * and attaches the user to context. Returns 401 on any failure.
 */
export const authMiddleware: MiddlewareHandler<AuthEnv> = async (c, next) => {
  const token = getCookie(c, "user_auth");

  if (!token) {
    c.status(401);
    return c.json({ msg: "Unauthorized" });
  }

  const { isValid, user } = await checkUserAuth(token);

  if (!isValid || !user) {
    c.status(401);
    return c.json({ msg: "Unauthorized" });
  }

  c.set("user", { id: user.id, name: user.name ?? "" });
  await next();
};
