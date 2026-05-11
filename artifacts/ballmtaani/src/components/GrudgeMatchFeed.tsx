import { RivalryCard } from "./RivalryCard";

export interface RivalryItem {
  id: string | number;
  challenger: { name: string; interactions: number; avatar?: string };
  defender: { name: string; interactions: number; avatar?: string };
  match: { home: string; away: string; homeLogo: string; awayLogo: string; time: string };
  bragLine: string;
  status: "pending" | "active" | "completed";
  winner?: string;
  prediction?: string;
}

const MOCK_RIVALRIES: RivalryItem[] = [
  {
    id: 1,
    challenger: { name: "Ochieng KE", interactions: 1250 },
    defender: { name: "Musa GH", interactions: 2100 },
    match: {
      home: "Arsenal",
      away: "Man City",
      homeLogo: "https://media.api-sports.io/football/teams/42.png",
      awayLogo: "https://media.api-sports.io/football/teams/50.png",
      time: "Live in 2h",
    },
    bragLine: "Receipt match",
    status: "active" as const,
  },
  {
    id: 2,
    challenger: { name: "Wanjiku KE", interactions: 450 },
    defender: { name: "Adebayo NG", interactions: 600 },
    match: {
      home: "Liverpool",
      away: "Chelsea",
      homeLogo: "https://media.api-sports.io/football/teams/40.png",
      awayLogo: "https://media.api-sports.io/football/teams/49.png",
      time: "Pending Response",
    },
    bragLine: "Timeline brag",
    status: "pending" as const,
  },
  {
    id: 3,
    challenger: { name: "KamauFC KE", interactions: 3200 },
    defender: { name: "Sipho ZA", interactions: 2800 },
    match: {
      home: "Real Madrid",
      away: "Barcelona",
      homeLogo: "https://media.api-sports.io/football/teams/541.png",
      awayLogo: "https://media.api-sports.io/football/teams/529.png",
      time: "Final Result",
    },
    bragLine: "Club pride",
    status: "completed" as const,
    winner: "KamauFC KE",
    prediction: "3-1",
  },
];

type RivalryStatus = "all" | "pending" | "active" | "completed";

export function GrudgeMatchFeed({
  scope = "all",
  statusFilter = "all",
  extraRivalries = [],
  onAcceptDuel,
  onSettleDuel,
}: {
  scope?: "all" | "active";
  statusFilter?: RivalryStatus;
  extraRivalries?: RivalryItem[];
  onAcceptDuel?: (id?: string | number) => void;
  onSettleDuel?: (id?: string | number) => void;
}) {
  const allRivalries = [...extraRivalries, ...MOCK_RIVALRIES];
  const scoped = allRivalries.filter((r) => {
    if (scope === "active") return r.status === "pending" || r.status === "active";
    return true;
  });
  const filtered = scoped.filter((r) => (statusFilter === "all" ? true : r.status === statusFilter));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((rivalry) => (
        <RivalryCard key={rivalry.id} {...rivalry} onAcceptDuel={onAcceptDuel} onSettleDuel={onSettleDuel} />
      ))}
    </div>
  );
}
