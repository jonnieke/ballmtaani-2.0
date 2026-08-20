import React from "react";
import { Badge } from "../ui/badge";
import { DataQualityScore } from "../../lib/edge/types";

export interface DataQualityBadgeProps {
  label: DataQualityScore;
}

export default function DataQualityBadge({ label }: DataQualityBadgeProps) {
  let bgClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

  if (label === "Good") bgClass = "bg-blue-500/10 text-blue-400 border-blue-500/20";
  if (label === "Limited") bgClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  if (label === "Insufficient") bgClass = "bg-red-500/10 text-red-400 border-red-500/20";

  return (
    <Badge className={`text-[10px] font-mono px-2 py-0.5 border ${bgClass}`}>
      Data Quality: {label}
    </Badge>
  );
}
