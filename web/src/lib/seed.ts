import { db, raw, schema } from "./db";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { uid } from "./utils";


const A = (category: string, label: string, icon: string, featured = 0) => ({ category, label, icon, featured });

const DELTA_UNO_AMENITIES = [
  A("Lo mas destacado", "WiFi gratis", "wifi", 1),
  A("Lo mas destacado", "Vistas al rio", "river", 1),
  A("Lo mas destacado", "Aire acondicionado", "snow", 1),
  A("Lo mas destacado", "Parrilla", "bbq", 1),
  A("Lo mas destacado", "Cocina equipada", "kitchen", 1),
  A("Lo mas destacado", "Habitaciones familiares", "family", 1),
  A("Ideal para tu estancia", "Bano privado", "shower"),
  A("Ideal para tu estancia", "Playa", "beach"),
  A("Ideal para tu estancia", "TV de pantalla plana", "tv"),
  A("Ideal para tu estancia", "Balcon", "balcony"),
  A("Ideal para tu estancia", "Terraza", "terrace"),
  A("Ideal para tu estancia", "Vistas", "view"),
  A("Cocina", "Utensilios de cocina", "utensils"),
  A("Cocina", "Zona de cocina", "kitchen"),
  A("Cocina", "Heladera", "fridge"),
  A("Bano", "Papel higienico", "toilet"),
  A("Bano", "Ducha", "shower"),
  A("Audiovisual y tecnologia", "TV de pantalla plana", "tv"),
  A("Exteriores", "Balcon", "balcony"),
  A("Exteriores", "Terraza de madera", "terrace"),
  A("Exteriores", "Jardin", "garden"),
  A("Exteriores", "Muelle propio", "river"),
  A("Comida y bebida", "Almuerzos para llevar", "restaurant"),
  A("Comida y bebida", "Bar", "bar"),
  A("Comida y bebida", "Restaurante", "restaurant"),
  A("Actividades", "Playa", "beach"),
  A("Vistas y exteriores", "Vistas al rio", "river"),
  A("Varios", "Calefaccion", "heat"),
  A("Varios", "Habitaciones sin humo", "nosmoke"),
  A("Varios", "Idioma: Espanol", "language"),
];

const DELTA_DOS_AMENITIES = [
  A("Lo mas destacado", "WiFi en todo el predio", "wifi", 1),
  A("Lo mas destacado", "Chimenea a lena", "fire", 1),
  A("Lo mas destacado", "Banera", "bath", 1),
  A("Lo mas destacado", "Galeria con hamacas", "terrace", 1),
  A("Lo mas destacado", "Parrilla y quincho", "bbq", 1),
  A("Lo mas destacado", "Aire acondicionado", "snow", 1),
  A("Ideal para tu estancia", "Bano privado", "shower"),
  A("Ideal para tu estancia", "Playa", "beach"),
  A("Ideal para tu estancia", "TV de pantalla plana", "tv"),
  A("Ideal para tu estancia", "Balcon", "balcony"),
  A("Ideal para tu estancia", "Habitaciones familiares", "family"),
  A("Ideal para tu estancia", "Terraza", "terrace"),
  A("Habitacion", "Armario", "wardrobe"),
  A("Habitacion", "Enchufe cerca de la cama", "plug"),
  A("Habitacion", "Perchero", "hanger"),
  A("Habitacion", "Piso de madera", "floor"),
  A("Habitacion", "Ventilador", "fan"),
  A("Bano", "Banera", "bath"),
  A("Bano", "Ducha", "shower"),
  A("Bano", "Bidet", "bidet"),
  A("Bano", "Papel higienico", "toilet"),
  A("Zona de estar", "Sofa", "sofa"),
  A("Zona de estar", "Chimenea", "fire"),
  A("Zona de estar", "Living comedor", "sofa"),
  A("Cocina", "Cafetera", "coffee"),
  A("Cocina", "Tostadora", "toaster"),
  A("Cocina", "Anafe", "kitchen"),
  A("Cocina", "Horno", "oven"),
  A("Cocina", "Utensilios de cocina", "utensils"),
  A("Cocina", "Pava electrica", "kettle"),
  A("Cocina", "Microondas", "microwave"),
  A("Cocina", "Heladera", "fridge"),
  A("Cocina", "Productos de limpieza", "cleaning"),
  A("Audiovisual y tecnologia", "Streaming (Netflix)", "streaming"),
  A("Audiovisual y tecnologia", "TV de pantalla plana", "tv"),
  A("Audiovisual y tecnologia", "Canales por cable y satelite", "cable"),
  A("Exteriores", "Chimenea exterior", "fire"),
  A("Exteriores", "Zona de comedor exterior", "outdoor"),
  A("Exteriores", "Muebles de exterior", "outdoor"),
  A("Exteriores", "Parrilla", "bbq"),
  A("Exteriores", "Patio", "patio"),
  A("Exteriores", "Balcon", "balcony"),
  A("Exteriores", "Terraza", "terrace"),
  A("Exteriores", "Jardin", "garden"),
  A("Comida y bebida", "Tetera / cafetera", "coffee"),
  A("Actividades", "Playa", "beach"),
  A("Actividades", "Senderismo", "hiking"),
  A("Actividades", "Kayak (de pago, fuera del alojamiento)", "kayak"),
  A("Actividades", "Pesca", "fishing"),
  A("Vistas y exteriores", "Vistas al jardin", "garden"),
  A("Accesibilidad", "Toda la unidad en planta baja", "accessible"),
  A("Varios", "Calefaccion", "heat"),
  A("Varios", "Idioma: Espanol", "language"),
];

const RULES = [
  { label: "Check-in", value: "De 10:00 a 18:00. Avisanos con antelacion a que hora llegas.", icon: "login" },
  { label: "Check-out", value: "De 08:00 a 18:00.", icon: "logout" },
  { label: "Ninos", value: "Se pueden alojar ninos de cualquier edad. Sin edad minima para el check-in.", icon: "family" },
  { label: "Camas supletorias", value: "No hay camas supletorias disponibles.", icon: "bed" },
  { label: "Pagos", value: "Solo se aceptan pagos en efectivo.", icon: "cash" },
  { label: "Fiestas", value: "No se pueden celebrar fiestas ni eventos.", icon: "nosmoke" },
  { label: "Mascotas", value: "No se admiten mascotas.", icon: "pet" },
  { label: "Estacionamiento", value: "No hay parking. Se llega en lancha colectiva desde la Estacion Fluvial de Tigre.", icon: "boat" },
];

const NEARBY = [
  { category: "Atracciones", name: "Museo Naval de la Nacion", distance: "650 m" },
  { category: "Atracciones", name: "Museo de La Reconquista", distance: "1,4 km" },
  { category: "Atracciones", name: "Museo de Arte Tigre", distance: "1,4 km" },
  { category: "Atracciones", name: "Circuito Historico Camino Real", distance: "1,4 km" },
  { category: "Atracciones", name: "Parque de la Costa", distance: "2,2 km" },
  { category: "Atracciones", name: "Quinta Presidencial de Olivos", distance: "15 km" },
  { category: "Gastronomia", name: "Restaurante Las Terraza", distance: "100 m" },
  { category: "Gastronomia", name: "Restaurante Tbc II", distance: "100 m" },
  { category: "Gastronomia", name: "Vuelta y Victoria", distance: "1 km" },
  { category: "Transporte", name: "Estacion Fluvial Delta", distance: "2,2 km" },
  { category: "Transporte", name: "Estacion de tren Tigre", distance: "2,2 km" },
  { category: "Aeropuertos", name: "Aeroparque Jorge Newbery", distance: "27 km" },
  { category: "Aeropuertos", name: "Aeropuerto de Ezeiza", distance: "50 km" },
];

const ACTIVITIES = [
  {
    title: "Navegar los arroyos",
    tag: "Agua",
    summary: "Lancha colectiva, kayak o canoa entre sauces y camalotes.",
    body: "El Delta se recorre por agua. Desde el muelle salen las lanchas colectivas que conectan con la Estacion Fluvial de Tigre, y a pocos minutos se alquilan kayaks y canoas para remar por los arroyos internos. Al atardecer el agua se vuelve espejo.",
    image: "/img/delta-uno/12.webp",
  },
  {
    title: "Almorzar sobre el rio",
    tag: "Gastronomia",
    summary: "Restaurantes y bares a 100 metros, mesas bajo los sauces.",
    body: "A cien metros hay parrillas y bares con mesas al aire libre bajo arboles centenarios, con vista directa al arroyo. Picadas, pescado de rio, tragos al atardecer y musica en vivo los fines de semana.",
    image: "/img/delta-uno/10.webp",
  },
  {
    title: "Pesca de costa",
    tag: "Aire libre",
    summary: "Dorado, boga y tararira desde el muelle privado.",
    body: "El muelle propio es un lugar tranquilo para pescar temprano. Se consiguen carnadas y equipo en los almacenes de la zona, y los baqueanos del lugar saben donde pica.",
    image: "/img/delta-uno/11.webp",
  },
  {
    title: "Senderismo isleno",
    tag: "Aire libre",
    summary: "Caminos de tierra, montes de sauce y aliso entre canales.",
    body: "Los senderos internos de la isla cruzan montes de sauce criollo y aliso. Es una caminata suave, ideal a la manana temprano, con puentes de madera y muelles vecinos en el recorrido.",
    image: "/img/delta-dos/12.webp",
  },
  {
    title: "Fogon y parrilla",
    tag: "En casa",
    summary: "Chimenea exterior, quincho y noches largas de sobremesa.",
    body: "La parrilla y la chimenea exterior son el centro de la noche. Se enciende el fuego cuando cae el sol, y la galeria con hamacas queda iluminada hasta tarde.",
    image: "/img/delta-dos/13.webp",
  },
  {
    title: "Museos y casco historico",
    tag: "Cultura",
    summary: "Museo de Arte Tigre, Museo Naval y el Camino Real.",
    body: "A pocos minutos en lancha esta el casco historico de Tigre: el Museo de Arte en el antiguo Tigre Club, el Museo Naval de la Nacion y el Circuito Historico Camino Real, con casonas de principios del siglo XX.",
    image: "/img/delta-dos/06.webp",
  },
];

const IMG_UNO: [string, string][] = [
  ["13", "La cabana vista desde el arroyo, entre sauces"],
  ["04", "Frente de la cabana con deck de madera bajo los arboles"],
  ["08", "Cocina y estar integrados con aire acondicionado"],
  ["03", "Dormitorio principal con cama matrimonial y ventanal al jardin"],
  ["07", "Segundo dormitorio con cuchetas"],
  ["06", "Cocina totalmente equipada"],
  ["01", "Bano privado con ducha"],
  ["02", "Bano completo"],
  ["05", "Parrilla bajo los arboles"],
  ["11", "Muelle de madera sobre el arroyo"],
  ["12", "Deck y amarre privado"],
  ["10", "Restaurante del rio, a 100 metros"],
  ["09", "Bar sobre la costa"],
];

const IMG_DOS: [string, string][] = [
  ["13", "Galeria con hamacas paraguayas sobre el deck"],
  ["08", "Living comedor amplio con piso de madera"],
  ["05", "Comedor con ventanales y salida a la galeria"],
  ["11", "Estar con TV, sofa y comedor"],
  ["10", "Dormitorio matrimonial con salida directa al deck"],
  ["09", "Segundo dormitorio matrimonial"],
  ["04", "Altillo con camas para grupos grandes"],
  ["01", "Habitacion con cuchetas"],
  ["03", "Bano completo con banera"],
  ["02", "Segundo bano con bacha de madera"],
  ["14", "Galeria techada a lo largo de la casa"],
  ["15", "Galeria con juegos y muebles de exterior"],
  ["07", "Deck de madera sobre el arroyo"],
  ["12", "La casa de noche, iluminada entre los arboles"],
  ["06", "Restaurante junto al rio, a pocos metros"],
];

async function main() {
  await db.delete(schema.images);
  await db.delete(schema.amenities);
  await db.delete(schema.rules);
  await db.delete(schema.nearby);
  await db.delete(schema.activities);
  await db.delete(schema.bookings);
  await db.delete(schema.blocks);
  await db.delete(schema.properties);
  await db.delete(schema.settings);

  const unoId = "prop_delta_uno";
  const dosId = "prop_delta_dos";

  await db.insert(schema.properties).values([
    {
      id: unoId, slug: "delta-uno", name: "Delta Uno", kind: "Cabana",
      tagline: "Cabana de madera sobre el Arroyo Gambado, con deck y muelle propio",
      description:
        "Delta Uno es una cabana de 90 m2 levantada sobre pilotes, a metros del agua. Tiene dos dormitorios, un estar integrado con cocina totalmente equipada, aire acondicionado frio-calor y un deck de madera que rodea la casa y termina en el muelle. Desde la cama se escucha el rio.\n\nEl jardin es compartido con arboles anosos, parrilla y bajada al arroyo. A cien metros hay restaurantes y bar sobre la costa, y la lancha colectiva pasa por el muelle.",
      address: "Arroyo Gambado 486, 1648 Tigre, Buenos Aires", lat: -34.4128, lng: -58.5793,
      sizeM2: 90, bedrooms: 2, bathrooms: 1, beds: 4, maxGuests: 6,
      basePrice: 85000, highPrice: 110000, cleaningFee: 15000, minNights: 2,
      rating: 9.6, reviews: 38, active: 1, sortOrder: 1,
    },
    {
      id: dosId, slug: "delta-dos", name: "Delta Dos", kind: "Casa",
      tagline: "Casa de 160 m2 con chimenea, banera y galeria para grupos grandes",
      description:
        "Delta Dos es la casa grande: 160 m2 con living comedor de doble altura, chimenea a lena, cocina completa y una galeria techada que recorre todo el frente, con hamacas paraguayas y mesa larga para comer afuera.\n\nTiene dos dormitorios matrimoniales en planta baja y un altillo con camas para grupos, ademas de dos banos, uno de ellos con banera. Afuera: parrilla, chimenea exterior, patio y bajada propia al arroyo.",
      address: "Arroyo Gambado 147, 1648 Tigre, Buenos Aires", lat: -34.4155, lng: -58.5821,
      sizeM2: 160, bedrooms: 3, bathrooms: 2, beds: 8, maxGuests: 12,
      basePrice: 145000, highPrice: 190000, cleaningFee: 22000, minNights: 2,
      rating: 9.7, reviews: 46, active: 1, sortOrder: 2,
    },
  ]);

  const imgs = [
    ...IMG_UNO.map(([n, alt], i) => ({ id: uid() + i, propertyId: unoId, url: `/img/delta-uno/${n}.webp`, alt, sortOrder: i })),
    ...IMG_DOS.map(([n, alt], i) => ({ id: uid() + "d" + i, propertyId: dosId, url: `/img/delta-dos/${n}.webp`, alt, sortOrder: i })),
  ];
  await db.insert(schema.images).values(imgs);

  await db.insert(schema.amenities).values([
    ...DELTA_UNO_AMENITIES.map((a, i) => ({ id: uid() + "a" + i, propertyId: unoId, ...a, sortOrder: i })),
    ...DELTA_DOS_AMENITIES.map((a, i) => ({ id: uid() + "b" + i, propertyId: dosId, ...a, sortOrder: i })),
  ]);

  await db.insert(schema.rules).values([
    ...RULES.map((r, i) => ({ id: uid() + "r" + i, propertyId: unoId, ...r, sortOrder: i })),
    ...RULES.map((r, i) => ({ id: uid() + "s" + i, propertyId: dosId, ...r, sortOrder: i })),
  ]);

  await db.insert(schema.nearby).values(NEARBY.map((n, i) => ({ id: uid() + "n" + i, ...n, sortOrder: i })));
  await db.insert(schema.activities).values(ACTIVITIES.map((a, i) => ({ id: uid() + "c" + i, ...a, sortOrder: i })));

  await db.insert(schema.settings).values([
    { key: "hero_eyebrow", value: "Primera seccion del Delta - Tigre, Buenos Aires" },
    { key: "hero_title", value: "Dos casas de madera\nsobre el Arroyo Gambado" },
    { key: "hero_subtitle", value: "A cuarenta minutos de Buenos Aires y a un mundo de distancia. Deck propio, monte de sauces y el sonido del agua toda la noche." },
    { key: "about_title", value: "El lugar" },
    { key: "about_body", value: "Delta Tigre son dos alojamientos independientes sobre el mismo arroyo, a 2,2 km del Parque de la Costa y a pocos minutos en lancha de la Estacion Fluvial de Tigre. Jardin con arboles anosos, parrilla, muelle y bajada al agua. Restaurantes y bar a cien metros." },
    { key: "whatsapp", value: process.env.NEXT_PUBLIC_WHATSAPP ?? "5491100000000" },
    { key: "email", value: "hola@deltatigre.com.ar" },
    { key: "instagram", value: "https://instagram.com/deltatigre" },
  ]);

  const ownerEmail = "propietario@deltatigre.com.ar";
  const exists = (await db.select().from(schema.users).where(eq(schema.users.email, ownerEmail)).limit(1))[0];
  if (!exists) {
    await db.insert(schema.users).values({
      id: uid(), name: "Propietario Delta Tigre", email: ownerEmail, phone: "",
      passwordHash: bcrypt.hashSync("DeltaTigre2026!", 10), role: "owner", createdAt: Date.now(),
    });
  }

  console.log("Seed OK ->", imgs.length, "imagenes");
  console.log("Owner:", ownerEmail, "/ DeltaTigre2026!");
}

main()
  .then(async () => { await raw.end(); process.exit(0); })
  .catch(async (e) => { console.error(e); await raw.end().catch(() => {}); process.exit(1); });
