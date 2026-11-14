import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      changeFrequency: "weekly",
      priority: 1,
      images: [`${site.url}/images/cocoya/drinks/mango-matcha.jpg`, `${site.url}/images/cocoya/interior/dining-hall.jpg`, `${site.url}/images/cocoya/interior/bar-counter.jpg`],
    },
  ];
}
