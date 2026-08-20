import { useEffect, useState } from "react";
import HeroTicker from "./HeroTicker";
import { fetchFootballNews, fetchPartnerArticles, type NewsArticle } from "../lib/news-api";
import { useMatches } from "../hooks/useData";

export function ScoreTicker() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const { data: matches = [] } = useMatches();

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([fetchPartnerArticles(), fetchFootballNews()]).then(([partnerResult, newsResult]) => {
      if (cancelled) return;
      const partner = partnerResult.status === "fulfilled" ? partnerResult.value : [];
      const headlines = newsResult.status === "fulfilled" ? newsResult.value : [];
      setArticles([...partner, ...headlines].slice(0, 12));
    });
    return () => { cancelled = true; };
  }, []);

  return <HeroTicker articles={articles} matches={matches} />;
}
