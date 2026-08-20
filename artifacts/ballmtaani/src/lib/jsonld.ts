/**
 * BallMtaani Schema.org JSON-LD Generators
 * Produces structured data matching visible page content.
 */

import { getSiteUrl } from "../config/site";

export function generateHomepageSchema() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "url": siteUrl,
        "name": "BallMtaani",
        "description": "Follow Premier League, Champions League, European and Kenyan football with live scores, fixtures, tables, predictions, fan debates and Mchambuzi AI analysis.",
        "inLanguage": "en-KE",
        "publisher": {
          "@id": `${siteUrl}/#organization`
        }
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        "name": "BallMtaani",
        "url": siteUrl,
        "logo": `${siteUrl}/logo.png`,
        "sameAs": [
          "https://twitter.com/ballmtaani",
          "https://www.facebook.com/ballmtaani",
          "https://www.instagram.com/ballmtaani"
        ]
      }
    ]
  };
}

export function generateLeagueSchema(league: { name: string; slug: string; description: string; country: string; season: number }) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/leagues/${league.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}/#webpage`,
        "url": pageUrl,
        "name": `${league.name} (${league.season}) — Live Scores & Table`,
        "description": league.description,
        "inLanguage": "en-KE"
      },
      {
        "@type": "SportsLeague",
        "@id": `${pageUrl}/#league`,
        "name": league.name,
        "url": pageUrl,
        "sport": "Soccer",
        "location": league.country
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
          { "@type": "ListItem", "position": 2, "name": "Leagues", "item": `${siteUrl}/leagues` },
          { "@type": "ListItem", "position": 3, "name": league.name, "item": pageUrl }
        ]
      }
    ]
  };
}

export function generateClubSchema(club: { name: string; slug: string; country: string; logo?: string; leagueName?: string }) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/teams/${club.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsTeam",
        "@id": `${pageUrl}/#team`,
        "name": club.name,
        "url": pageUrl,
        "sport": "Soccer",
        "logo": club.logo || `${siteUrl}/logo.png`,
        "location": club.country,
        "memberOf": club.leagueName ? { "@type": "SportsLeague", "name": club.leagueName } : undefined
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
          { "@type": "ListItem", "position": 2, "name": "Clubs", "item": `${siteUrl}/leagues` },
          { "@type": "ListItem", "position": 3, "name": club.name, "item": pageUrl }
        ]
      }
    ]
  };
}

export function generateMatchSchema(match: {
  matchSlug: string;
  homeTeam: string;
  awayTeam: string;
  startDateISO: string;
  venue?: string;
  status: string;
  leagueName: string;
}) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/matches/${match.matchSlug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SportsEvent",
        "@id": `${pageUrl}/#event`,
        "name": `${match.homeTeam} vs ${match.awayTeam}`,
        "url": pageUrl,
        "startDate": match.startDateISO,
        "sport": "Soccer",
        "eventStatus": match.status === "finished" ? "https://schema.org/EventCompleted" : "https://schema.org/EventScheduled",
        "homeTeam": { "@type": "SportsTeam", "name": match.homeTeam },
        "awayTeam": { "@type": "SportsTeam", "name": match.awayTeam },
        "location": match.venue ? { "@type": "Place", "name": match.venue } : undefined,
        "superEvent": { "@type": "SportsLeague", "name": match.leagueName }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
          { "@type": "ListItem", "position": 2, "name": "Matches", "item": `${siteUrl}/matches` },
          { "@type": "ListItem", "position": 3, "name": `${match.homeTeam} vs ${match.awayTeam}`, "item": pageUrl }
        ]
      }
    ]
  };
}

export function generateArticleSchema(article: {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  imageUrl?: string;
}) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/article/${article.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": `${pageUrl}/#article`,
        "url": pageUrl,
        "headline": article.title,
        "description": article.excerpt,
        "datePublished": article.publishedAt,
        "dateModified": article.updatedAt || article.publishedAt,
        "mainEntityOfPage": pageUrl,
        "image": article.imageUrl ? [article.imageUrl] : [`${siteUrl}/opengraph.jpg`],
        "author": { "@type": "Person", "name": article.author },
        "publisher": { "@type": "Organization", "name": "BallMtaani", "logo": { "@type": "ImageObject", "url": `${siteUrl}/logo.png` } }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}/#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
          { "@type": "ListItem", "position": 2, "name": "Articles", "item": `${siteUrl}/articles` },
          { "@type": "ListItem", "position": 3, "name": article.title, "item": pageUrl }
        ]
      }
    ]
  };
}
