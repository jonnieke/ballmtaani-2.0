import { Route, Switch, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Navbar } from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import { AmbientBackground } from "./components/AmbientBackground";
import { CoinOverlay } from "./components/CoinOverlay";
import { useState, useEffect } from "react";

import { verifyGeminiConnection, verifyFootballConnection, verifySupabaseConnection } from "./lib/api-verify";

import HomePage from "./pages/HomePage";
import MatchesPage from "./pages/MatchesPage";
import PredictionsPage from "./pages/PredictionsPage";
import DebatesPage from "./pages/DebatesPage";
import FanZonesPage from "./pages/FanZonesPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import StorePage from "./pages/StorePage";
import LiveCenterPage from "./pages/LiveCenterPage";
import LiveCenterIndexPage from "./pages/LiveCenterIndexPage";
import RivalriesPage from "./pages/RivalriesPage";
import RapidFirePage from "./pages/RapidFirePage";
import TriviaPage from "./pages/TriviaPage";
import DiagnosticsPage from "./pages/DiagnosticsPage";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/auth/LoginPage";
import VerifyOTPPage from "./pages/auth/OTPPage";

const queryClient = new QueryClient();

export default function App() {
  const [statuses, setStatuses] = useState<Record<string, any>>({
    gemini: { status: 'loading' },
    football: { status: 'loading' },
    supabase: { status: 'loading' }
  });

  useEffect(() => {
    const checkAll = async () => {
      const results = await Promise.all([
        verifyGeminiConnection(),
        verifyFootballConnection(),
        verifySupabaseConnection()
      ]);
      setStatuses({
        gemini: results[0],
        football: results[1],
        supabase: results[2]
      });
    };
    checkAll();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <AmbientBackground />
          <CoinOverlay />
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>

          <div className="min-h-screen bg-[#0B0B0B] text-white font-sans selection:bg-[#B30000] selection:text-white">
            <Navbar />
            <BottomNav />
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/login" component={LoginPage} />
              <Route path="/verify" component={VerifyOTPPage} />
              <Route path="/matches" component={MatchesPage} />
              <Route path="/predictions" component={PredictionsPage} />
              <Route path="/debates" component={DebatesPage} />
              <Route path="/fan-zones" component={FanZonesPage} />
              <Route path="/leaderboard" component={LeaderboardPage} />
              <Route path="/profile" component={ProfilePage} />
              <Route path="/profile/:id" component={ProfilePage} />
              <Route path="/store" component={StorePage} />
              <Route path="/live-center" component={LiveCenterIndexPage} />
              <Route path="/live-center/:id" component={LiveCenterPage} />
              <Route path="/rivalries" component={RivalriesPage} />
              <Route path="/rapid-fire" component={RapidFirePage} />
              <Route path="/trivia" component={TriviaPage} />
              <Route path="/diagnostics" component={DiagnosticsPage} />
          
          {/* Protected Routes */}
              <Route>
                <div className="flex flex-col items-center justify-center min-h-[70vh]">
                  <h1 className="text-4xl font-black text-[#B30000] mb-4">404 - OFFSIDE!</h1>
                  <p className="text-gray-400">The page you're looking for is out of bounds.</p>
                </div>
              </Route>
            </Switch>
            
            {/* Global Footer */}
            <footer className="border-t border-[#1B1B1B] bg-[#0B0B0B] mt-20 py-12">
              <div className="max-w-6xl mx-auto px-4 text-center">
                <h3 className="text-xl font-black tracking-widest text-white uppercase mb-4">
                  Ball<span className="text-[#B30000]">Mtaani</span>
                </h3>
                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                  The ultimate social football platform for African fans. Predict, debate, banter, and connect with fans across the continent.
                </p>
                <p className="text-gray-600 text-xs">
                  © {new Date().getFullYear()} BallMtaani. All rights reserved.
                </p>
              </div>
            </footer>

            {/* Development Utility: API Status Tracker */}
            {import.meta.env.DEV && (
              <div className="fixed bottom-4 left-4 z-[9999] bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-2xl text-[10px] uppercase font-bold tracking-widest flex flex-col gap-2">
                <div className="text-gray-500 mb-1">System Health check</div>
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${statuses.supabase.status === 'connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : statuses.supabase.status === 'loading' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></span>
                   SUPABASE
                </div>
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${statuses.gemini.status === 'connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : statuses.gemini.status === 'loading' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></span>
                   GEMINI AI
                </div>
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${statuses.football.status === 'connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : statuses.football.status === 'loading' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></span>
                   FOOTBALL API
                </div>
              </div>
            )}
          </div>
        </WouterRouter>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
}
