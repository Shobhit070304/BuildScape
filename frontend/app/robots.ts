import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/projects", "/u/"],
        disallow: ["/api/", "/profile", "/projects/*/workspace"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/projects", "/u/"],
        disallow: ["/api/", "/profile", "/projects/*/workspace"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
