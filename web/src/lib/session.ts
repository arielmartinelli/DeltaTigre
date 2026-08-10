import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "delta_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-change-me-dev-secret-change-me"
);

export type SessionUser = { id: string; name: string; email: string; role: "guest" | "owner" };

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: String(payload.id),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role === "owner" ? "owner" : "guest",
    };
  } catch {
    return null;
  }
}

export async function requireOwner() {
  const s = await getSession();
  if (!s || s.role !== "owner") throw new Error("No autorizado");
  return s;
}
