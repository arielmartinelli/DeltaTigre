import { loadEnv } from "./env";
loadEnv();

import { db, raw, schema } from "./db";
import { eq, and } from "drizzle-orm";

/**
 * Correcciones de contenido sobre la base existente.
 * Es idempotente y NO borra reservas, usuarios ni bloqueos:
 *   npm run ajustes
 */
const UNO = "prop_delta_uno";
const DOS = "prop_delta_dos";

async function main() {
  let n = 0;
  const paso = (t: string) => { n++; console.log(`  ${n}. ${t}`); };

  console.log("Aplicando correcciones...\n");

  // ---------- Delta Uno ----------
  await db.update(schema.properties).set({
    tagline: "Cabaña de madera sobre el Arroyo Gambado, con deck, parrilla y bajada al agua",
    description:
      "Delta Uno es una cabaña de 90 m² levantada sobre pilotes, a metros del agua. Tiene dos dormitorios, " +
      "un estar integrado con cocina totalmente equipada, aire acondicionado frío-calor y un deck de madera " +
      "que rodea la casa y baja hasta el arroyo. Desde la cama se escucha el río.\n\n" +
      "El jardín y el muelle son compartidos, con árboles añosos, parrilla y bajada al arroyo. A cien metros " +
      "hay restaurantes y bar sobre la costa, y la lancha colectiva pasa por el muelle.",
  }).where(eq(schema.properties.id, UNO));
  paso("Delta Uno: descripción y bajada (muelle compartido)");

  // ---------- Delta Dos ----------
  await db.update(schema.properties).set({
    tagline: "Casa de 160 m² con salamandra, parrilla y galería con hamacas",
    description:
      "Delta Dos es la casa grande: 160 m² con living comedor de doble altura, salamandra a leña, cocina " +
      "completa y una galería techada que recorre todo el frente, con hamacas paraguayas y mesa larga para " +
      "comer afuera.\n\n" +
      "Tiene dos dormitorios matrimoniales en planta baja y un altillo con camas para grupos, además de un " +
      "baño completo con bañera. Afuera: parrilla, fogón, patio y bajada al arroyo.",
    bathrooms: 1,
    maxGuests: 10,
  }).where(eq(schema.properties.id, DOS));
  paso("Delta Dos: 1 baño, hasta 10 huéspedes, nueva bajada");

  // ---------- Servicios ----------
  await db.update(schema.amenities).set({ label: "Muelle compartido" })
    .where(and(eq(schema.amenities.propertyId, UNO), eq(schema.amenities.label, "Muelle propio")));
  paso("Servicio: «Muelle propio» → «Muelle compartido»");

  await db.update(schema.amenities).set({ label: "Salamandra a leña" })
    .where(and(eq(schema.amenities.propertyId, DOS), eq(schema.amenities.label, "Chimenea a lena")));
  await db.update(schema.amenities).set({ label: "Salamandra" })
    .where(and(eq(schema.amenities.propertyId, DOS), eq(schema.amenities.label, "Chimenea")));
  await db.update(schema.amenities).set({ label: "Fogón exterior" })
    .where(and(eq(schema.amenities.propertyId, DOS), eq(schema.amenities.label, "Chimenea exterior")));
  paso("Servicios: chimenea → salamandra / fogón");

  // ---------- Normas ----------
  const reglas = await db.select().from(schema.rules).where(eq(schema.rules.label, "Pagos"));
  for (const r of reglas) {
    await db.update(schema.rules)
      .set({ value: "Se abona en efectivo o por transferencia bancaria." })
      .where(eq(schema.rules.id, r.id));
  }
  paso(`Normas: forma de pago actualizada (${reglas.length} fichas)`);

  // ---------- Experiencias ----------
  const pesca = (await db.select().from(schema.activities)).find((a) => a.title.includes("Pesca"));
  if (pesca) {
    await db.update(schema.activities).set({
      body:
        "El muelle es un lugar tranquilo para pescar temprano. Se consiguen carnadas y equipo en los " +
        "almacenes de la zona, y los baqueanos del lugar saben dónde pica.",
      summary: "Dorado, boga y tararira desde el muelle.",
    }).where(eq(schema.activities.id, pesca.id));
    paso("Experiencia «Pesca»: sin referencia a muelle propio");
  }

  // ---------- Fotos ----------
  const fotos = await db.select().from(schema.images).where(eq(schema.images.propertyId, UNO));
  for (const f of fotos.filter((x) => x.alt.includes("amarre privado"))) {
    await db.update(schema.images).set({ alt: "Deck sobre el arroyo" }).where(eq(schema.images.id, f.id));
  }
  paso("Fotos: descripción del deck");

  console.log("\nListo. Revisá el sitio y el panel.");
}

main()
  .then(async () => { await raw.end(); process.exit(0); })
  .catch(async (e) => { console.error(e); await raw.end().catch(() => {}); process.exit(1); });
