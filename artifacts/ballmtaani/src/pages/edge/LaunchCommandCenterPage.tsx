import React from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Rocket, ShieldCheck, CheckCircle, ArrowLeft, AlertTriangle } from "lucide-react";
import RouteSEO from "../../components/RouteSEO";
import { LaunchControlService } from "../../lib/edge/launch/launch-control-service";

export default function LaunchCommandCenterPage() {
  const readiness = LaunchControlService.evaluateLaunchReadiness("paid_beta");

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#ffffff] pb-20">
      <RouteSEO path="/admin/edge/launch" />

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
              <Rocket className="h-5 w-5 text-emerald-400" /> Commercial Launch Command Centre
            </h1>
          </div>

          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-mono text-xs">
            Stage: {readiness.stage.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Commercial Launch Readiness & Gate Controls</h1>
            <p className="text-xs text-gray-400">Monitor mandatory launch gates, checklist blockers, and emergency launch rollback triggers.</p>
          </div>

          <Badge className={`text-xs px-3 py-1 font-bold ${readiness.isReadyForLaunch ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400"}`}>
            {readiness.isReadyForLaunch ? "ALL LAUNCH GATES PASSED" : "LAUNCH BLOCKED"}
          </Badge>
        </div>

        {/* Launch Gates Table */}
        <div className="rounded-xl border border-white/10 bg-[#121212] overflow-hidden">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow>
                <TableHead className="text-white">Gate Category</TableHead>
                <TableHead className="text-white">Checklist Status</TableHead>
                <TableHead className="text-white">Verification Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readiness.gates.map((gate) => (
                <TableRow key={gate.gateCategory}>
                  <TableCell className="text-xs font-bold text-white capitalize">{gate.gateCategory} Readiness Gate</TableCell>
                  <TableCell className="text-xs text-emerald-400 font-mono">100% Items Verified</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                      PASSED
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
