import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Settings, Play, Database, ShieldAlert, CheckCircle, RefreshCw, ArrowLeft, Activity, Server, AlertTriangle, Cpu, BarChart2, CheckSquare, CreditCard, Users, Zap, Search, Bell, Heart, Sparkles, Gift, Code, Globe, ShieldCheck, TrendingUp, Layers, Rocket, Handshake } from "lucide-react";
import { DataSyncService } from "../../lib/edge/data/sync-service";
import { getSupportedCompetitionsList } from "../../lib/edge/data/competitions-config";
import RouteSEO from "../../components/RouteSEO";
import { LaunchWaveService } from "../../lib/edge/waves/launch-wave-service";
import { PartnershipPipelineService } from "../../lib/edge/partnerships/partnership-pipeline-service";

export default function AdminEdgePage() {
  const [isRunningJob, setIsRunningJob] = useState<boolean>(false);
  const [jobSuccess, setJobSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("data-foundation");
  const [apiCallsToday, setApiCallsToday] = useState<number>(142);

  const syncService = new DataSyncService();
  const competitions = getSupportedCompetitionsList();
  const wave = LaunchWaveService.getActiveLaunchWave();
  const opp = PartnershipPipelineService.evaluateOpportunity("Safaricom SuperApp", "telecom");

  const handleSyncCompetitions = async () => {
    setIsRunningJob(true);
    setJobSuccess(null);
    try {
      const res = await syncService.syncCompetitions();
      setApiCallsToday(res.apiCallsUsed);
      setJobSuccess(`Competitions sync completed successfully. Processed ${res.recordsRequested} leagues.`);
    } catch (err: any) {
      setJobSuccess(`Sync Error: ${err?.message || String(err)}`);
    } finally {
      setIsRunningJob(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#ffffff] pb-20">
      <RouteSEO path="/admin/edge" />

      {/* Header */}
      <div className="border-b border-white/10 bg-black/60 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" /> Admin Console
              </Button>
            </Link>
            <span className="text-gray-600">/</span>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-emerald-400" /> BallMtaani Edge Control Panel
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-mono text-xs">
              Status: Scaled Launch Executing
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 text-xs font-bold gap-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("data-foundation")}
            className={`pb-3 shrink-0 flex items-center gap-2 transition-colors ${activeTab === "data-foundation" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-400 hover:text-white"}`}
          >
            <Database className="h-4 w-4" /> Data Foundation (Phase 2)
          </button>

          <button
            onClick={() => setActiveTab("predictions-lab")}
            className={`pb-3 shrink-0 flex items-center gap-2 transition-colors ${activeTab === "predictions-lab" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-400 hover:text-white"}`}
          >
            <Cpu className="h-4 w-4" /> Predictions Lab (Phase 3)
          </button>

          <button
            onClick={() => setActiveTab("backtesting")}
            className={`pb-3 shrink-0 flex items-center gap-2 transition-colors ${activeTab === "backtesting" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-400 hover:text-white"}`}
          >
            <BarChart2 className="h-4 w-4" /> Backtesting & Calibration (Phase 4)
          </button>

          <button
            onClick={() => setActiveTab("billing-subscriptions")}
            className={`pb-3 shrink-0 flex items-center gap-2 transition-colors ${activeTab === "billing-subscriptions" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-400 hover:text-white"}`}
          >
            <CreditCard className="h-4 w-4" /> Billing & Subscriptions (Phase 6)
          </button>

          <button
            onClick={() => setActiveTab("alerts-retention")}
            className={`pb-3 shrink-0 flex items-center gap-2 transition-colors ${activeTab === "alerts-retention" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-400 hover:text-white"}`}
          >
            <Bell className="h-4 w-4" /> Alerts & Retention (Phase 7)
          </button>

          <button
            onClick={() => setActiveTab("personalization-b2b")}
            className={`pb-3 shrink-0 flex items-center gap-2 transition-colors ${activeTab === "personalization-b2b" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-400 hover:text-white"}`}
          >
            <Sparkles className="h-4 w-4" /> Personalization & B2B (Phase 8)
          </button>

          <button
            onClick={() => setActiveTab("enterprise-operations")}
            className={`pb-3 shrink-0 flex items-center gap-2 transition-colors ${activeTab === "enterprise-operations" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-400 hover:text-white"}`}
          >
            <ShieldCheck className="h-4 w-4" /> Enterprise Operations (Phase 9)
          </button>

          <button
            onClick={() => setActiveTab("model-scaleup")}
            className={`pb-3 shrink-0 flex items-center gap-2 transition-colors ${activeTab === "model-scaleup" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-400 hover:text-white"}`}
          >
            <TrendingUp className="h-4 w-4" /> Ensembles & Scale-Up (Phase 10)
          </button>

          <button
            onClick={() => setActiveTab("market-launch")}
            className={`pb-3 shrink-0 flex items-center gap-2 transition-colors ${activeTab === "market-launch" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-400 hover:text-white"}`}
          >
            <Rocket className="h-4 w-4" /> Market Launch (Phase 11)
          </button>

          <button
            onClick={() => setActiveTab("commercial-execution")}
            className={`pb-3 shrink-0 flex items-center gap-2 transition-colors ${activeTab === "commercial-execution" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-gray-400 hover:text-white"}`}
          >
            <Handshake className="h-4 w-4" /> Commercial Execution (Phase 12)
          </button>
        </div>

        {/* Tab 1: Data Foundation */}
        {activeTab === "data-foundation" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Football Data Foundation & Sync Controls</h2>
                <p className="text-xs text-gray-400">Normalized competitions, team aliases, fixtures, and data-quality monitoring.</p>
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={handleSyncCompetitions} disabled={isRunningJob} className="bg-emerald-600 text-xs font-bold text-white">
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Sync Competitions
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#121212] overflow-hidden">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow>
                    <TableHead className="text-white">ID</TableHead>
                    <TableHead className="text-white">Competition Name</TableHead>
                    <TableHead className="text-white">Country</TableHead>
                    <TableHead className="text-white">Strength</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competitions.map((comp) => (
                    <TableRow key={comp.providerId}>
                      <TableCell className="text-xs text-gray-400 font-mono">{comp.providerId}</TableCell>
                      <TableCell className="text-xs font-bold text-white">{comp.name}</TableCell>
                      <TableCell className="text-xs text-gray-300">{comp.country}</TableCell>
                      <TableCell className="text-xs font-mono text-emerald-400">{comp.competitionStrength}</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                          Approved Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Tab 10: Commercial Execution */}
        {activeTab === "commercial-execution" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Controlled Commercial Execution, Launch Waves & Strategic Partnerships</h2>
              <p className="text-xs text-gray-400">Manage active launch waves, server-side subscriber ceilings, B2B partner opportunities, user activation milestones, and expansion scorecards.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
                <span className="text-xs text-gray-400 block">Active Launch Wave</span>
                <span className="text-xl font-extrabold text-white font-mono">{wave.name}</span>
                <span className="text-[10px] text-emerald-400 block">Stage: {wave.stage.toUpperCase()}</span>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
                <span className="text-xs text-gray-400 block">Subscriber Ceiling</span>
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">{wave.currentSubscriberCount.toLocaleString()} / {wave.subscriberLimit.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-400 block">Server-Side Enforced</span>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
                <span className="text-xs text-gray-400 block">Lead Partnership</span>
                <span className="text-xl font-extrabold text-white font-mono">{opp.organizationName}</span>
                <span className="text-[10px] text-emerald-400 block">Strategic Score: {opp.overallStrategicScore} / 100</span>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-[#121212]">
                <span className="text-xs text-gray-400 block">User Activation Rate</span>
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">88%</span>
                <span className="text-[10px] text-emerald-400 block">3/3 Milestones Completed</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
