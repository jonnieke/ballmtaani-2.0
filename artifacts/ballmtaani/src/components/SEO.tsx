import { useEffect } from "react";

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://ballmtaani.com").replace(/\/$/, "");
const DEFAULT_IMAGE = `${SITE_URL}/opengraph.jpg`;

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  path?: string;
  canonicalUrl?: string;
  type?: "website" | "article";
  noindex?: boolean;
  breadcrumbs?: { name: string; url: string }[];
  structuredData?: Record<string, any> | Record<string, any>[];
  jsonLd?: Record<string, any> | Record<string, any>[];
}

export default function SEO({ 
  title = "BallMtaani - Kenyan Football Intelligence, Live Scores and Fan Debate", 
  description = "BallMtaani gives Kenyan football fans live scores, fixtures, World Cup 2026 tracking, predictions, debates, fan zones and AI-powered match intelligence.",
  keywords = [
    "BallMtaani",
    "Kenyan football fans",
    "football live scores Kenya",
    "Premier League Kenya",
    "World Cup 2026",
    "football predictions",
    "football debates",
  ],
  image = DEFAULT_IMAGE,
  url,
  path,
  type = "website",
  noindex = false,
  breadcrumbs,
  structuredData
}: SEOProps) {
  
  useEffect(() => {
    const currentPath = path || window.location.pathname || "/";
    const canonicalPath = currentPath === "/home" ? "/" : currentPath;
    const absoluteUrl = url || `${SITE_URL}${canonicalPath === "/" ? "/" : canonicalPath}`;
    const absoluteImage = image.startsWith("http") ? image : `${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`;

    // Basic Meta
    document.title = title;
    
    const updateMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      let element = document.querySelector(`${attr === "name" ? "meta[name='" + name + "']" : "meta[property='" + name + "']"}`);
      if (!element) {
        element = document.createElement("meta");
        if (attr === "name") element.setAttribute("name", name);
        else element.setAttribute("property", name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // SEO
    updateMeta("description", description);
    updateMeta("keywords", keywords.join(", "));
    updateMeta("application-name", "BallMtaani");
    updateMeta("author", "BallMtaani");
    updateMeta("theme-color", "#B30000");
    
    // OpenGraph (Facebook/WhatsApp)
    updateMeta("og:title", title, "property");
    updateMeta("og:description", description, "property");
    updateMeta("og:image", absoluteImage, "property");
    updateMeta("og:image:alt", "BallMtaani football live scores and fan intelligence", "property");
    updateMeta("og:url", absoluteUrl, "property");
    updateMeta("og:type", type, "property");
    updateMeta("og:site_name", "BallMtaani", "property");
    updateMeta("og:locale", "en_KE", "property");

    // Twitter
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", title);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", absoluteImage);
    updateMeta("twitter:image:alt", "BallMtaani football live scores and fan intelligence");
    updateMeta("robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");

    // Canonical
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", absoluteUrl);

    // JSON-LD
    const existingNodes = document.querySelectorAll("script[data-seo-jsonld='1']");
    existingNodes.forEach((n) => n.remove());

    const breadcrumbData = breadcrumbs?.length
      ? [{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": breadcrumbs.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
          })),
        }]
      : [];
    const custom = structuredData ? (Array.isArray(structuredData) ? structuredData : [structuredData]) : [];
    [...breadcrumbData, ...custom].forEach((entry) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-jsonld", "1");
      script.text = JSON.stringify(entry);
      document.head.appendChild(script);
    });

  }, [title, description, keywords, image, url, path, type, noindex, breadcrumbs, structuredData]);

  return null; // Side-effect only component
}


