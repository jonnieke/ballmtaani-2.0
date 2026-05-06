import { RivalryCard } from "./RivalryCard";

const MOCK_RIVALRIES = [
  {
    id: 1,
    challenger: { name: "Ochieng 🇰🇪", interactions: 1250 },
    defender: { name: "Musa 🇬🇭", interactions: 2100 },
    match: {
      home: "Arsenal",
      away: "Man City",
      homeLogo: "https://media.api-sports.io/football/teams/42.png",
      awayLogo: "https://media.api-sports.io/football/teams/50.png",
      time: "Live in 2h"
    },
    stake: 2000,
    status: "active" as const,
  },
  {
    id: 2,
    challenger: { name: "Wanjiku 🇰🇪", interactions: 450 },
    defender: { name: "Adebayo 🇳🇬", interactions: 600 },
    match: {
      home: "Liverpool",
      away: "Chelsea",
      homeLogo: "https://media.api-sports.io/football/teams/40.png",
      awayLogo: "https://media.api-sports.io/football/teams/49.png",
      time: "Pending Response"
    },
    stake: 500,
    status: "pending" as const,
  },
  {
    id: 3,
    challenger: { name: "KamauFC 🇰🇪", interactions: 3200 },
    defender: { name: "Sipho 🇿🇦", interactions: 2800 },
    match: {
      home: "Real Madrid",
      away: "Barcelona",
      homeLogo: "https://media.api-sports.io/football/teams/541.png",
      awayLogo: "https://media.api-sports.io/football/teams/529.png",
      time: "Final Result"
    },
    stake: 5000,
    status: "completed" as const,
    winner: "KamauFC 🇰🇪",
    prediction: "3-1"
  }
];

export function GrudgeMatchFeed() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {MOCK_RIVALRIES.map(rivalry => (
        <RivalryCard key={rivalry.id} {...rivalry} />
      ))}
    </div>
  );
}
