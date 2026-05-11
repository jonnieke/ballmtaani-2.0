import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  noindex?: boolean;
  structuredData?: Record<string, any> | Record<string, any>[];
}

export default function SEO({ 
  title = "BallMtaani - Kenyan Fans, Big Match Banter", 
  description = "Kenyan football fans predict, debate, and keep receipts around the biggest football matches.",
  image = "https://ballmtaani20.vercel.app/opengraph.jpg",
  url = "https://ballmtaani20.vercel.app",
  type = "website",
  noindex = false,
  structuredData
}: SEOProps) {
  
  useEffect(() => {
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
    
    // OpenGraph (Facebook/WhatsApp)
    updateMeta("og:title", title, "property");
    updateMeta("og:description", description, "property");
    updateMeta("og:image", image, "property");
    updateMeta("og:url", url, "property");
    updateMeta("og:type", type, "property");
    updateMeta("og:site_name", "BallMtaani", "property");
    updateMeta("og:locale", "en_KE", "property");

    // Twitter
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", title);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", image);
    updateMeta("robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");

    // Canonical
    let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    // JSON-LD
    const existingNodes = document.querySelectorAll("script[data-seo-jsonld='1']");
    existingNodes.forEach((n) => n.remove());

    const baseStructuredData = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "BallMtaani",
        "url": "https://ballmtaani20.vercel.app",
        "logo": "https://ballmtaani20.vercel.app/logo.png",
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "BallMtaani",
        "url": "https://ballmtaani20.vercel.app",
        "inLanguage": "en-KE",
      }
    ];

    const custom = structuredData ? (Array.isArray(structuredData) ? structuredData : [structuredData]) : [];
    [...baseStructuredData, ...custom].forEach((entry) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-jsonld", "1");
      script.text = JSON.stringify(entry);
      document.head.appendChild(script);
    });

  }, [title, description, image, url, type, noindex, structuredData]);

  return null; // Side-effect only component
}
