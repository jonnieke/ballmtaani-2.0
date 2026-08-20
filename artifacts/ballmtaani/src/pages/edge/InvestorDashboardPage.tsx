import React from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { TrendingUp, Folder, Download, ArrowLeft, ShieldCheck, CheckCircle } from "lucide-react";
import RouteSEO from "../../components/RouteSEO";
import { InvestorDataRoomService } from "../../lib/edge/finance/investor-data-room-service";
import { FinancialLedgerEngine } from "../../lib/edge/finance/financial-ledger-engine";

export default function InvestorDashboardPage() {
  const documents = InvestorDataRoomService.getAvailableDataRoomDocuments();
  const ledger = FinancialLedgerEngine.calculatePeriodProfitability();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#ffffff] pb-20">
      <RouteSEO path="/admin/edge/investor" />

      {/* Header */}
      <div className="border-b border-white/10 bg-black/60 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/edge">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" /> Edge Control Panel
              </Button>
            </Link>
            <span className="text-gray-600">/</span>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" /> Investor Reporting & Data Room
            </h1>
          </div>

          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-mono text-xs">
            Audited Financial Period: Q3 2026
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Profitability Ledger & Controlled Data Room</h1>
          <p className="text-xs text-gray-400">Audited contribution margins, net revenues, variable costs, and secure data room documents.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
            <span className="text-xs text-gray-400 block">Gross Revenue (Period)</span>
            <span className="text-2xl font-extrabold text-white font-mono">KES {(ledger.grossRevenueKes / 1000000).toFixed(2)}M</span>
            <span className="text-[10px] text-emerald-400 block">Confirmed Consumer & B2B</span>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
            <span className="text-xs text-gray-400 block">Direct Variable Costs</span>
            <span className="text-2xl font-extrabold text-white font-mono">KES {(ledger.totalVariableCostKes / 1000).toFixed(0)}K</span>
            <span className="text-[10px] text-gray-400 block">Data, Fees, SMS, Revenue Share</span>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
            <span className="text-xs text-gray-400 block">Contribution Margin (Net)</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">KES {(ledger.contributionMarginKes / 1000000).toFixed(2)}M</span>
            <span className="text-[10px] text-emerald-400 block">{ledger.contributionMarginPercentage}% Contribution Margin</span>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
            <span className="text-xs text-gray-400 block">Audited Data Room Documents</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">{documents.length} Files</span>
            <span className="text-[10px] text-emerald-400 block">Role-Controlled Access</span>
          </div>
        </div>

        {/* Data Room Table */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Folder className="h-4 w-4 text-emerald-400" /> Investor Data Room Document Registry
          </h3>

          <div className="rounded-xl border border-white/10 bg-[#121212] overflow-hidden">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow>
                  <TableHead className="text-white">Document Title</TableHead>
                  <TableHead className="text-white">Category</TableHead>
                  <TableHead className="text-white">Version</TableHead>
                  <TableHead className="text-white">Confidentiality</TableHead>
                  <TableHead className="text-white">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="text-xs font-bold text-white">{doc.title}</TableCell>
                    <TableCell className="text-xs text-gray-300 uppercase font-mono">{doc.category}</TableCell>
                    <TableCell className="text-xs text-gray-300 font-mono">{doc.version}</TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                        {doc.confidentiality.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" className="text-emerald-400 text-xs font-bold hover:text-emerald-300">
                        <Download className="mr-1 h-3.5 w-3.5" /> Download Signed PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
