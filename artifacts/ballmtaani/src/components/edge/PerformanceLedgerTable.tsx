import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";

export interface SettledPredictionRecord {
  date: string;
  competition: string;
  fixtureName: string;
  predictedHomeProb: number;
  predictedDrawProb: number;
  predictedAwayProb: number;
  confidence: string;
  actualScore: string;
  settlementStatus: "Prediction Aligned" | "Prediction Did Not Align";
}

export interface PerformanceLedgerTableProps {
  records: SettledPredictionRecord[];
}

export default function PerformanceLedgerTable({ records }: PerformanceLedgerTableProps) {
  if (!records || records.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#121212] overflow-hidden">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow>
            <TableHead className="text-white">Date</TableHead>
            <TableHead className="text-white">Competition</TableHead>
            <TableHead className="text-white">Match</TableHead>
            <TableHead className="text-white">Probabilities (H / D / A)</TableHead>
            <TableHead className="text-white">Confidence</TableHead>
            <TableHead className="text-white">Actual Score</TableHead>
            <TableHead className="text-white">Settlement Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((r, idx) => (
            <TableRow key={idx}>
              <TableCell className="text-xs text-gray-400 font-mono">{r.date}</TableCell>
              <TableCell className="text-xs font-semibold text-gray-300">{r.competition}</TableCell>
              <TableCell className="text-xs font-bold text-white">{r.fixtureName}</TableCell>
              <TableCell className="text-xs font-mono text-emerald-400">
                {Math.round(r.predictedHomeProb * 100)}% / {Math.round(r.predictedDrawProb * 100)}% / {Math.round(r.predictedAwayProb * 100)}%
              </TableCell>
              <TableCell className="text-xs text-gray-300">{r.confidence}</TableCell>
              <TableCell className="text-xs font-mono font-extrabold text-white">{r.actualScore}</TableCell>
              <TableCell>
                <Badge
                  className={
                    r.settlementStatus === "Prediction Aligned"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]"
                      : "bg-gray-800 text-gray-400 border-gray-700 text-[10px]"
                  }
                >
                  {r.settlementStatus}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
