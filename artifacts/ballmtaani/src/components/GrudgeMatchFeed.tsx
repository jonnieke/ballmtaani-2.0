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
  const allRivalries = [...extraRivalries];
  const scoped = allRivalries.filter((r) => {
    if (scope === "active") return r.status === "pending" || r.status === "active";
    return true;
  });
  const filtered = scoped.filter((r) => (statusFilter === "all" ? true : r.status === statusFilter));

  if (filtered.length === 0) {
    return (
      <div className="col-span-full rounded-2xl border border-white/10 bg-[#111] p-10 text-center">
        <p className="text-sm font-black uppercase tracking-widest text-gray-500 mb-2">No active duels yet</p>
        <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">Challenge a fan from their profile to start the first duel.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((rivalry) => (
        <RivalryCard key={rivalry.id} {...rivalry} onAcceptDuel={onAcceptDuel} onSettleDuel={onSettleDuel} />
      ))}
    </div>
  );
}
