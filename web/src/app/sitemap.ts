import type { MetadataRoute } from "next";
import { getActiveProperties } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  let props: Awaited<ReturnType<typeof getActiveProperties>> = [];
  try { props = await getActiveProperties(); } catch {}

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/cabanas`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/ubicacion`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/experiencias`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...props.map((p) => ({
      url: `${base}/cabanas/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.95,
    })),
  ];
}
