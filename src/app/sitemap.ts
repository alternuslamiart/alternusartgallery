import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.alternusart.com";
  const now = new Date();

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/main`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/ai-assistant`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/code-builder`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/cerevix-design`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blender-3d`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/platform/overview`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/platform/api`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cookie-notice`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
