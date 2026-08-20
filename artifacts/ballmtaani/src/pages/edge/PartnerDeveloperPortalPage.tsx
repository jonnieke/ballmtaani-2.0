import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Code, Key, Globe, Shield, ArrowLeft, Copy, Check, Terminal, Layers } from "lucide-react";
import { B2BApiService } from "../../lib/edge/personalization/b2b-api-service";
import RouteSEO from "../../components/RouteSEO";

export default function PartnerDeveloperPortalPage() {
  const [apiKey, setApiKey] = useState<{ rawKey: string; keyPrefix: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleGenerateKey = () => {
    const key = B2BApiService.generateApiKey("client-pub-101", ["*"]);
    setApiKey(key);
  };

  const widgetEmbedCode = `<div data-ballmtaani-edge-widget="match_card" data-fixture-id="epl-201" data-theme="dark"></div>\n<script async src="https://ballmtaani.co.ke/widgets/edge.js"></script>`;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#ffffff] pb-20">
      <RouteSEO path="/partners/edge/developers" />

      {/* Header */}
      <div className="border-b border-white/10 bg-black/60 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/edge">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" /> Edge Home
              </Button>
            </Link>
            <span className="text-gray-600">/</span>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Code className="h-5 w-5 text-emerald-400" /> B2B Partner & Publisher Developer Portal
            </h1>
          </div>

          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Partner Tier: Pro Publisher</Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">API Keys & Embeddable Widgets</h1>
          <p className="text-xs text-gray-400">Generate secure API keys, manage domain allowlists, and get embeddable widget snippets for sports publishers.</p>
        </div>

        {/* API Key Management */}
        <div className="p-6 rounded-xl border border-white/10 bg-[#121212] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">B2B API Keys</h2>
              <p className="text-xs text-gray-400">SHA-256 hashed API keys for server-side prediction data feeds.</p>
            </div>
            <Button onClick={handleGenerateKey} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
              <Key className="mr-1.5 h-3.5 w-3.5" /> Generate New API Key
            </Button>
          </div>

          {apiKey && (
            <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/40 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-bold">New API Key Generated (Copy now, hash stored securely):</span>
                <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(apiKey.rawKey); setCopiedKey(true); setTimeout(() => setCopiedKey(false), 2000); }} className="text-emerald-400 hover:text-emerald-300">
                  {copiedKey ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  {copiedKey ? "Copied" : "Copy"}
                </Button>
              </div>
              <code className="block bg-black/60 p-2 rounded text-white text-sm select-all">{apiKey.rawKey}</code>
            </div>
          )}
        </div>

        {/* Widget Embed Code Generator */}
        <div className="p-6 rounded-xl border border-white/10 bg-[#121212] space-y-4">
          <h2 className="text-lg font-bold text-white">Embeddable Match Prediction Widget</h2>
          <p className="text-xs text-gray-400">Copy and paste this HTML snippet directly onto your sports publication or media site.</p>

          <pre className="p-4 rounded-lg bg-black/80 border border-white/10 text-emerald-400 font-mono text-xs overflow-x-auto">
            {widgetEmbedCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
