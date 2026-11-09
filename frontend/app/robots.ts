import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/projects"],
        disallow: ["/api/", "/profile", "/admin", "/admin/*", "/projects/*/workspace"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/projects"],
        disallow: ["/api/", "/profile", "/admin", "/admin/*", "/projects/*/workspace"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
