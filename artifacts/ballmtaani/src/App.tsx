import { Route, Switch, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Navbar } from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import { AmbientBackground } from "./components/AmbientBackground";
import { CoinOverlay } from "./components/CoinOverlay";
import { DailyLoginModal } from "./components/DailyLoginModal";
import { OnboardingModal } from "./components/OnboardingModal";
import { InstallBanner } from "./components/InstallBanner";
import { ScoreTicker } from "./components/ScoreTicker";

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
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import LoginPage from "./pages/auth/LoginPage";
import VerifyOTPPage from "./pages/auth/OTPPage";

const queryClient = new QueryClient();

function AppShell() {
  const [location] = useLocation();
  const { pendingLoginStreak, clearPendingLoginStreak } = useAuth();
  const normalizedLocation = location.replace(/\/+$/, "") || "/";
  const quietPage = ["/login", "/verify", "/terms", "/privacy"].includes(normalizedLocation);

  return (
    <>
      <AmbientBackground />
      <CoinOverlay />

      {/* Daily Login Streak Modal */}
      {pendingLoginStreak?.isNewDay && (
        <DailyLoginModal
          streak={pendingLoginStreak.streak}
          coinsEarned={pendingLoginStreak.coinsEarned}
          bonusEarned={pendingLoginStreak.bonusEarned}
          onClose={clearPendingLoginStreak}
        />
      )}

      <div className="min-h-screen bg-[#0B0B0B] text-white font-sans selection:bg-[#B30000] selection:text-white">
        {!quietPage && <Navbar />}
        {!quietPage && <ScoreTicker />}
        {!quietPage && <BottomNav />}
        {!quietPage && <OnboardingModal />}
        {!quietPage && <InstallBanner />}
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
            <Route path="/terms" component={TermsPage} />
            <Route path="/terms/" component={TermsPage} />
            <Route path="/terms-of-service" component={TermsPage} />
            <Route path="/privacy" component={PrivacyPage} />
            <Route path="/privacy/" component={PrivacyPage} />
            <Route path="/privacy-policy" component={PrivacyPage} />
            <Route>
              <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <h1 className="text-4xl font-black text-[#B30000] mb-4">404 - OFFSIDE!</h1>
                <p className="text-gray-400">The page you're looking for is out of bounds.</p>
              </div>
            </Route>
        </Switch>

        {!quietPage && (
          <footer className="border-t border-[#1B1B1B] bg-[#0B0B0B] mt-20 py-12">
            <div className="max-w-6xl mx-auto px-4 text-center">
              <h3 className="text-xl font-black tracking-widest text-white uppercase mb-4">
                Ball<span className="text-[#B30000]">Mtaani</span>
              </h3>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                Kenyan football fans predicting, debating, and keeping receipts around the biggest matches.
              </p>
              <p className="text-gray-600 text-xs">
                (c) {new Date().getFullYear()} BallMtaani. All rights reserved. MTC status points are platform engagement rewards with no monetary value.
              </p>
            </div>
          </footer>
        )}
      </div>
    </>
  );
}

function AppInner() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <AppShell />
    </WouterRouter>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <AppInner />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
