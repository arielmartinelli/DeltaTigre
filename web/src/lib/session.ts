import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * Dos sesiones totalmente independientes, cada una con su propia cookie:
 *
 *   huesped     -> delta_huesped   (sitio publico y /mi-cuenta)
 *   propietario -> delta_admin     (/propietario y /panel)
 *
 * No se pisan ni se heredan: estar logueado como huesped no da ningun acceso
 * al panel, y viceversa. Se puede tener las dos abiertas a la vez.
 */
export type Scope = "guest" | "owner";

const COOKIES: Record<Scope, string> = {
  guest: "delta_huesped",
  owner: "delta_admin",
};

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-change-me-dev-secret-change-me"
);

export type SessionUser = { id: string; name: string; email: string; role: Scope };

async function sign(user: SessionUser, scope: Scope) {
  return new SignJWT({ ...user, scope })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(scope === "owner" ? "7d" : "30d")
    .sign(secret);
}

export async function createSession(user: SessionUser, scope: Scope) {
  const jar = await cookies();
  jar.set(COOKIES[scope], await sign(user, scope), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * (scope === "owner" ? 7 : 30),
  });
}

export async function destroySession(scope: Scope) {
  const jar = await cookies();
  jar.delete(COOKIES[scope]);
}

async function read(scope: Scope): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIES[scope])?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    // El token tiene que haber sido emitido para este ambito.
    if (payload.scope !== scope) return null;
    return {
      id: String(payload.id),
      name: String(payload.name),
      email: String(payload.email),
      role: scope,
    };
  } catch {
    return null;
  }
}

/** Sesion de huesped: sitio publico, reservas y /mi-cuenta. */
export const getGuestSession = () => read("guest");

/** Sesion de propietario: /propietario y /panel. */
export const getOwnerSession = () => read("owner");

export async function requireOwner() {
  const s = await getOwnerSession();
  if (!s) throw new Error("No autorizado");
  return s;
}
