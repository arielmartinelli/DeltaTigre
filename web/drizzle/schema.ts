import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("guest"), // guest | owner
  createdAt: integer("created_at").notNull(),
});

export const properties = sqliteTable("properties", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  kind: text("kind").notNull().default("Casa"),
  tagline: text("tagline").notNull().default(""),
  description: text("description").notNull().default(""),
  address: text("address").notNull().default(""),
  lat: real("lat").notNull().default(-34.418),
  lng: real("lng").notNull().default(-58.579),
  sizeM2: integer("size_m2").notNull().default(0),
  bedrooms: integer("bedrooms").notNull().default(1),
  bathrooms: integer("bathrooms").notNull().default(1),
  beds: integer("beds").notNull().default(1),
  maxGuests: integer("max_guests").notNull().default(2),
  basePrice: integer("base_price").notNull().default(0),
  priceMonThu: integer("price_mon_thu").notNull().default(0),
  priceFri: integer("price_fri").notNull().default(0),
  priceSatSun: integer("price_sat_sun").notNull().default(0),
  highPrice: integer("high_price").notNull().default(0),
  cleaningFee: integer("cleaning_fee").notNull().default(0),
  minNights: integer("min_nights").notNull().default(2),
  currency: text("currency").notNull().default("ARS"),
  rating: real("rating").notNull().default(0),
  reviews: integer("reviews").notNull().default(0),
  checkIn: text("check_in").notNull().default("10:00 - 18:00"),
  checkOut: text("check_out").notNull().default("08:00 - 18:00"),
  active: integer("active").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const images = sqliteTable("images", {
  id: text("id").primaryKey(),
  propertyId: text("property_id").notNull(),
  url: text("url").notNull(),
  alt: text("alt").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const amenities = sqliteTable("amenities", {
  id: text("id").primaryKey(),
  propertyId: text("property_id").notNull(),
  category: text("category").notNull(),
  label: text("label").notNull(),
  icon: text("icon").notNull().default("check"),
  featured: integer("featured").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const rules = sqliteTable("rules", {
  id: text("id").primaryKey(),
  propertyId: text("property_id").notNull(),
  label: text("label").notNull(),
  value: text("value").notNull(),
  icon: text("icon").notNull().default("info"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const nearby = sqliteTable("nearby", {
  id: text("id").primaryKey(),
  category: text("category").notNull(), // atraccion | gastronomia | transporte | aeropuerto
  name: text("name").notNull(),
  distance: text("distance").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const activities = sqliteTable("activities", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  body: text("body").notNull().default(""),
  image: text("image").notNull().default(""),
  tag: text("tag").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  propertyId: text("property_id").notNull(),
  userId: text("user_id").notNull(),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestPhone: text("guest_phone").notNull().default(""),
  checkIn: text("check_in").notNull(),
  checkOut: text("check_out").notNull(),
  nights: integer("nights").notNull().default(1),
  adults: integer("adults").notNull().default(1),
  children: integer("children").notNull().default(0),
  message: text("message").notNull().default(""),
  estimate: integer("estimate").notNull().default(0),
  status: text("status").notNull().default("pendiente"), // pendiente | confirmada | rechazada | cancelada
  ownerReply: text("owner_reply").notNull().default(""),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const blocks = sqliteTable("blocks", {
  id: text("id").primaryKey(),
  propertyId: text("property_id").notNull(),
  fromDate: text("from_date").notNull(),
  toDate: text("to_date").notNull(),
  reason: text("reason").notNull().default("Bloqueo manual"),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});

export const rates = sqliteTable("rates", {
  id: text("id").primaryKey(),
  propertyId: text("property_id").notNull(),
  day: text("day").notNull(),
  price: integer("price").notNull(),
});

export const guestPrices = sqliteTable("guest_prices", {
  id: text("id").primaryKey(),
  propertyId: text("property_id").notNull(),
  guests: integer("guests").notNull(),
  priceMonThu: integer("price_mon_thu").notNull().default(0),
  priceFri: integer("price_fri").notNull().default(0),
  priceSatSun: integer("price_sat_sun").notNull().default(0),
});
