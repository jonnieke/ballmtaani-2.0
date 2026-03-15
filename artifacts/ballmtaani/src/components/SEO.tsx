import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export default function SEO({ 
  title = "BallMtaani - Africa's #1 Social Football Hub", 
  description = "Predict, debate, and dominate the football world. Join the ultimate community for African football fans.",
  image = "https://ballmtaani.com/og-image.jpg", // Replace with real OG image URL
  url = "https://ballmtaani.com"
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
    updateMeta("og:type", "website", "property");

    // Twitter
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", title);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", image);

  }, [title, description, image, url]);

  return null; // Side-effect only component
}
