import { loadEnv } from "./env";
loadEnv();

import { db, raw, schema } from "./db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { uid } from "./utils";

/**
 * Crea o actualiza el usuario propietario.
 *   npm run owner -- correo@dominio.com "TuNuevaClave" "Nombre Apellido"
 */
async function main() {
  const [email, password, name] = process.argv.slice(2);

  if (!email || !password) {
    console.error('Uso: npm run owner -- correo@dominio.com "TuNuevaClave" ["Nombre Apellido"]');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("La contrasena tiene que tener al menos 8 caracteres.");
    process.exit(1);
  }

  const mail = email.trim().toLowerCase();
  const hash = bcrypt.hashSync(password, 10);
  const found = (await db.select().from(schema.users).where(eq(schema.users.email, mail)).limit(1))[0];

  if (found) {
    await db.update(schema.users)
      .set({ passwordHash: hash, role: "owner", name: name ?? found.name })
      .where(eq(schema.users.id, found.id));
    console.log(`Contrasena actualizada para ${mail} (rol: owner)`);
  } else {
    await db.insert(schema.users).values({
      id: uid(), name: name ?? "Propietario", email: mail, phone: "",
      passwordHash: hash, role: "owner", createdAt: Date.now(),
    });
    console.log(`Propietario creado: ${mail}`);
  }
}

main()
  .then(async () => { await raw.end(); process.exit(0); })
  .catch(async (e) => { console.error(e); await raw.end().catch(() => {}); process.exit(1); });
