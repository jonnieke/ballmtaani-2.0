import { getUserTier } from "../lib/tiers";

interface UserBadgeProps {
  interactions: number;
  className?: string; // Optional expansion for custom sizing
  showLabel?: boolean;
}

export function UserBadge({ interactions, className = "", showLabel = true }: UserBadgeProps) {
  const tier = getUserTier(interactions);
  const Icon = tier.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${tier.color} ${tier.glow} ${className}`}
      title={`${interactions} Interactions`}
    >
      <Icon className={`w-3 h-3 md:w-3.5 md:h-3.5 ${tier.label === "Club Legend" || tier.label === "Captain" ? "drop-shadow-lg" : ""}`} />
      {showLabel && <span>{tier.label}</span>}
    </div>
  );
}
