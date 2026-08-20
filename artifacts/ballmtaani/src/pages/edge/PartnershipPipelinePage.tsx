import React from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Handshake, ArrowLeft, CheckCircle, FileText, Plus } from "lucide-react";
import RouteSEO from "../../components/RouteSEO";
import { PartnershipPipelineService } from "../../lib/edge/partnerships/partnership-pipeline-service";

export default function PartnershipPipelinePage() {
  const opp = PartnershipPipelineService.evaluateOpportunity("Safaricom SuperApp", "telecom");
  const proposal = PartnershipPipelineService.generateCommercialProposal(opp.id, 50000);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#ffffff] pb-20">
      <RouteSEO path="/admin/edge/partnerships" />

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
              <Handshake className="h-5 w-5 text-emerald-400" /> B2B Strategic Partnerships & Proposal Pipeline
            </h1>
          </div>

          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-mono text-xs">
            Commercial Pipeline Active
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Strategic Partner Opportunity Pipeline & Commercial Proposals</h1>
          <p className="text-xs text-gray-400">Score B2B/telecom/media partner opportunities, calculate proposal contribution margins, and manage pilot provisioning.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
            <span className="text-xs text-gray-400 block">Lead Opportunity</span>
            <span className="text-xl font-extrabold text-white font-mono">{opp.organizationName}</span>
            <span className="text-[10px] text-emerald-400 block">Stage: {opp.opportunityStage.toUpperCase()}</span>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
            <span className="text-xs text-gray-400 block">Strategic Score</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">{opp.overallStrategicScore} / 100</span>
            <span className="text-[10px] text-emerald-400 block">Audience & Technical Feasibility</span>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
            <span className="text-xs text-gray-400 block">Proposed Monthly Price</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">KES {(proposal.proposedMonthlyPriceKes / 1000).toFixed(0)}K</span>
            <span className="text-[10px] text-emerald-400 block">KES {(proposal.estimatedContributionKes / 1000).toFixed(0)}K Net Contribution</span>
          </div>
        </div>

        {/* Partnership Table */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Active Strategic Partner Pipeline</h3>
          <div className="rounded-xl border border-white/10 bg-[#121212] overflow-hidden">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow>
                  <TableHead className="text-white">Organization Name</TableHead>
                  <TableHead className="text-white">Partner Type</TableHead>
                  <TableHead className="text-white">Stage</TableHead>
                  <TableHead className="text-white">Strategic Score</TableHead>
                  <TableHead className="text-white">Monthly Proposal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-xs font-bold text-white">Safaricom SuperApp</TableCell>
                  <TableCell className="text-xs text-gray-300 uppercase font-mono">TELECOM</TableCell>
                  <TableCell className="text-xs text-emerald-400 font-bold">PROPOSAL</TableCell>
                  <TableCell className="text-xs text-emerald-400 font-mono font-bold">88 / 100</TableCell>
                  <TableCell className="text-xs text-white font-mono font-bold">KES 250,000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs font-bold text-white">Standard Media Group</TableCell>
                  <TableCell className="text-xs text-gray-300 uppercase font-mono">MEDIA_PUBLISHER</TableCell>
                  <TableCell className="text-xs text-emerald-400 font-bold">QUALIFIED</TableCell>
                  <TableCell className="text-xs text-emerald-400 font-mono font-bold">82 / 100</TableCell>
                  <TableCell className="text-xs text-white font-mono font-bold">KES 150,000</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
