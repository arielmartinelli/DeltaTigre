import type { MetadataRoute } from "next";
import { getActiveProperties } from "@/lib/data";
const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let props: Awaited<ReturnType<typeof getActiveProperties>> = [];
  try { props = await getActiveProperties(); } catch {}
  const now = new Date();
  return [
    { url: base, lastModified: now, priority: 1 },
    { url: `${base}/cabanas`, lastModified: now, priority: 0.9 },
    { url: `${base}/ubicacion`, lastModified: now, priority: 0.7 },
    { url: `${base}/experiencias`, lastModified: now, priority: 0.7 },
    ...props.map((p) => ({ url: `${base}/cabanas/${p.slug}`, lastModified: now, priority: 0.95 })),
  ];
}
