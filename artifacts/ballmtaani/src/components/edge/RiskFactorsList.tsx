import React from "react";
import { AlertTriangle } from "lucide-react";

export interface RiskFactorsListProps {
  riskFactors: string[];
}

export default function RiskFactorsList({ riskFactors }: RiskFactorsListProps) {
  if (!riskFactors || riskFactors.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
        <AlertTriangle className="h-3.5 w-3.5" /> Key Uncertainties & Risk Factors
      </h4>
      <ul className="space-y-1.5">
        {riskFactors.map((factor, idx) => (
          <li key={idx} className="text-xs text-gray-300 bg-amber-500/10 border border-amber-500/20 p-2 rounded flex items-start gap-2">
            <span className="text-amber-400 font-bold">•</span>
            <span>{factor}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
