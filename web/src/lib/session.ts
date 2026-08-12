import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * Unica sesion del sistema: la del propietario.
 * El sitio publico no tiene cuentas — las consultas salen por WhatsApp.
 */
export type Scope = "owner";

const COOKIES: Record<Scope, string> = {
  owner: "delta_admin",
};

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-change-me-dev-secret-change-me"
);

export type SessionUser = { id: string; name: string; email: string; role: Scope };

const DIAS_CORTA = 1;
const DIAS_RECORDAR = 180;

async function sign(user: SessionUser, dias: number) {
  return new SignJWT({ ...user, scope: "owner" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${dias}d`)
    .sign(secret);
}

/**
 * `recordar` mantiene la sesion 6 meses: no se cierra hasta que el propietario
 * apriete "Cerrar sesion". Sin eso, dura un dia.
 */
export async function createSession(user: SessionUser, recordar = true) {
  const dias = recordar ? DIAS_RECORDAR : DIAS_CORTA;
  const jar = await cookies();
  jar.set(COOKIES.owner, await sign(user, dias), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * dias,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIES.owner);
}

export async function getOwnerSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIES.owner)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    // El token tiene que haber sido emitido para este ambito.
    if (payload.scope !== "owner") return null;
    return {
      id: String(payload.id),
      name: String(payload.name),
      email: String(payload.email),
      role: "owner",
    };
  } catch {
    return null;
  }
}

export async function requireOwner() {
  const s = await getOwnerSession();
  if (!s) throw new Error("No autorizado");
  return s;
}
