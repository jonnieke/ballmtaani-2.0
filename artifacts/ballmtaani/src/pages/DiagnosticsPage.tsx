import { useState } from "react";
import { Shield, Zap, Database, Activity, CheckCircle2, XCircle, Loader2, ChevronLeft, Trophy, Bell } from "lucide-react";
import { verifyGeminiConnection, verifyFootballConnection, verifySupabaseConnection } from "../lib/api-verify";
import { Link } from "wouter";
import { supabase } from "../lib/supabase";

interface TestState {
  status: 'idle' | 'loading' | 'pass' | 'fail';
  message: string;
}

export default function DiagnosticsPage() {
  const [gemini, setGemini] = useState<TestState>({ status: 'idle', message: 'Not tested' });
  const [football, setFootball] = useState<TestState>({ status: 'idle', message: 'Not tested' });
  const [supabaseTest, setSupabaseTest] = useState<TestState>({ status: 'idle', message: 'Not tested' });

  const runTest = async (key: 'gemini' | 'football' | 'supabase') => {
    const setter = key === 'gemini' ? setGemini : key === 'football' ? setFootball : setSupabaseTest;
    const fn = key === 'gemini' ? verifyGeminiConnection : key === 'football' ? verifyFootballConnection : verifySupabaseConnection;

    setter({ status: 'loading', message: 'Testing connection...' });
    
    try {
      const result = await fn();
      if (result.status === 'connected') {
        setter({ status: 'pass', message: result.message });
      } else {
        setter({ status: 'fail', message: result.message });
      }
    } catch (err) {
      setter({ status: 'fail', message: 'Uncaught network error' });
    }
  };

  const simulateEndOfWeek = async () => {
    if (!confirm("This will reset all user points and award prizes to the top 3. Are you sure?")) return;
    try {
      const { error } = await supabase.rpc('process_weekly_tournament');
      if (error) throw error;
      alert("Weekly tournament processed successfully!");
    } catch (err: any) {
      alert("Failed to process tournament: " + err.message);
    }
  };

  const testLocalPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification("Live Match Alert", {
        body: "Arsenal just scored! 1-0 against Chelsea.",
        icon: "/logo.png",
        badge: "/logo.png"
      });
    } catch (err) {
      alert("Push failed. Make sure notifications are enabled in your Profile.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/profile">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Service Status</h1>
          <p className="text-gray-500 text-sm">Real-time API & Connection Diagnostics</p>
        </div>
      </div>

      <div className="grid gap-6 max-w-2xl mx-auto">
        {/* Gemini API */}
        <DiagnosticCard 
          title="Gemini 1.5 Flash" 
          description="A.I. Trivia & Tactical Insights"
          icon={<Zap className="w-6 h-6 text-[#1E6FFF]" />}
          state={gemini}
          onTest={() => runTest('gemini')}
        />

        {/* Football API */}
        <DiagnosticCard 
          title="API-Football" 
          description="Live Scores, Fixtures & Stats"
          icon={<Activity className="w-6 h-6 text-primary" />}
          state={football}
          onTest={() => runTest('football')}
        />

        {/* Supabase */}
        <DiagnosticCard 
          title="Supabase Backend" 
          description="Authentication & User Data"
          icon={<Database className="w-6 h-6 text-[#3ECF8E]" />}
          state={supabaseTest}
          onTest={() => runTest('supabase')}
        />

        {/* Admin Tools for Phase 5 */}
        <div className="mt-8 p-6 rounded-3xl bg-[#1B1B1B] border border-white/10">
          <h2 className="text-xl font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Admin Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={simulateEndOfWeek} className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl text-left transition-colors">
              <Trophy className="w-6 h-6 text-[#FFD700] mb-2" />
              <h3 className="font-bold text-white uppercase text-sm">Simulate End of Week</h3>
              <p className="text-xs text-gray-500 mt-1">Triggers tournament status rewards and resets leaderboard.</p>
            </button>
            <button onClick={testLocalPush} className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl text-left transition-colors">
              <Bell className="w-6 h-6 text-[#00FF00] mb-2" />
              <h3 className="font-bold text-white uppercase text-sm">Local Push Test</h3>
              <p className="text-xs text-gray-500 mt-1">Triggers a test notification via Service Worker.</p>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
        <Shield className="w-10 h-10 text-gray-600 mx-auto mb-4" />
        <h3 className="font-bold text-gray-400">Security Note</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto mt-2">
          Diagnostic tests are ephemeral and help verify your environment configuration. 
          Make sure your Vercel/Local referrers match your Google Cloud Console settings.
        </p>
      </div>
    </div>
  );
}

function DiagnosticCard({ title, description, icon, state, onTest }: any) {
  const isIdle = state.status === 'idle';
  const isLoading = state.status === 'loading';
  const isPass = state.status === 'pass';
  const isFail = state.status === 'fail';

  return (
    <div className={`p-6 rounded-3xl border transition-all duration-500 ${isPass ? 'bg-[#3ECF8E]/5 border-[#3ECF8E]/20' : isFail ? 'bg-primary/5 border-primary/20' : 'bg-white/5 border-white/10'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-black rounded-2xl border border-white/5">
            {icon}
          </div>
          <div>
            <h3 className="font-black text-lg">{title}</h3>
            <p className="text-gray-500 text-xs">{description}</p>
          </div>
        </div>
        <div>
          {isPass && <CheckCircle2 className="w-6 h-6 text-[#3ECF8E] animate-in zoom-in duration-300" />}
          {isFail && <XCircle className="w-6 h-6 text-primary animate-in zoom-in duration-300" />}
        </div>
      </div>

      <div className={`text-sm font-medium mb-6 ${isPass ? 'text-[#3ECF8E]' : isFail ? 'text-primary' : 'text-gray-500'}`}>
        {state.message}
      </div>

      <button
        onClick={onTest}
        disabled={isLoading}
        className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2
          ${isLoading ? 'bg-white/5 text-gray-500' : 'bg-white/10 hover:bg-white/20 text-white active:scale-95'}`}
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Run Connection Test"}
      </button>
    </div>
  );
}
