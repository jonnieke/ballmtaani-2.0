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
import AdBanner from "./components/AdBanner";
import RouteSEO from "./components/RouteSEO";
import FloatingNav from "./components/FloatingNav";
import { lazy, Suspense } from "react";

// ─── Route-level code splitting ───────────────────────────────────────────────
// Each page is loaded only when navigated to — reduces initial bundle by ~50%
// LandingPage and HomePage are eagerly loaded (most visited, need fast paint)
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";

const MatchesPage        = lazy(() => import("./pages/MatchesPage"));
const PredictionsPage    = lazy(() => import("./pages/PredictionsPage"));
const DebatesPage        = lazy(() => import("./pages/DebatesPage"));
const FanZonesPage       = lazy(() => import("./pages/FanZonesPage"));
const LeaderboardPage    = lazy(() => import("./pages/LeaderboardPage"));
const ProfilePage        = lazy(() => import("./pages/ProfilePage"));
const StorePage          = lazy(() => import("./pages/StorePage"));
const LiveCenterPage     = lazy(() => import("./pages/LiveCenterPage"));
const LiveCenterIndexPage= lazy(() => import("./pages/LiveCenterIndexPage"));
const RivalriesPage      = lazy(() => import("./pages/RivalriesPage"));
const RapidFirePage      = lazy(() => import("./pages/RapidFirePage"));
const TriviaPage         = lazy(() => import("./pages/TriviaPage"));
const WarRoomPage        = lazy(() => import("./pages/WarRoomPage"));
const DiagnosticsPage    = lazy(() => import("./pages/DiagnosticsPage"));
const TermsPage          = lazy(() => import("./pages/TermsPage"));
const PrivacyPage        = lazy(() => import("./pages/PrivacyPage"));
const WorldCup2026Page   = lazy(() => import("./pages/WorldCup2026Page"));
const WorldCupGuidePage   = lazy(() => import("./pages/WorldCupGuidePage"));
const MarketWatchPage    = lazy(() => import("./pages/MarketWatchPage"));
const MchambuziHalisiPage= lazy(() => import("./pages/MchambuziHalisiPage"));
const LoginPage          = lazy(() => import("./pages/auth/LoginPage"));
const VerifyOTPPage      = lazy(() => import("./pages/auth/OTPPage"));
const AuthCallbackPage   = lazy(() => import("./pages/auth/AuthCallbackPage"));
import WelcomeModal from "./components/WelcomeModal";

// Minimal loading fallback — dark bg matches app shell, no layout shift
function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#B30000]" />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0, // Disable retries — we have fallbacks (mock data, cached data, empty state)
      // When API fails, show empty state instead of retrying 3x and hammering the API
    },
  },
});

function AppShell() {
  const [location] = useLocation();
  const { pendingLoginStreak, clearPendingLoginStreak } = useAuth();
  const normalizedLocation = location.replace(/\/+$/, "") || "/";
  const isWorldCupPage = normalizedLocation === "/world-cup-2026" || normalizedLocation.startsWith("/world-cup-2026/");
  const quietPage = ["/", "/mchambuzi-halisi", "/login", "/verify", "/terms", "/privacy"].includes(normalizedLocation) || isWorldCupPage;
  const showInstallBanner = ["/", "/home", "/world-cup-2026"].includes(normalizedLocation);
  const showAdBanner = !["/login", "/verify"].includes(normalizedLocation);

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
        {quietPage && !normalizedLocation.startsWith("/login") && !normalizedLocation.startsWith("/verify") && (
          <FloatingNav />
        )}
        {!quietPage && <OnboardingModal />}
        {showInstallBanner && <InstallBanner />}
        <RouteSEO path={normalizedLocation} />
        <Suspense fallback={<PageLoader />}>
        <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/home" component={HomePage} />
            <Route path="/world-cup-2026" component={WorldCup2026Page} />
            <Route path="/world-cup-2026/:guide" component={WorldCupGuidePage} />
            <Route path="/mchambuzi-halisi" component={MchambuziHalisiPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/verify" component={VerifyOTPPage} />
            <Route path="/auth/callback" component={AuthCallbackPage} />
            <Route path="/matches" component={MatchesPage} />
            <Route path="/market-watch" component={MarketWatchPage} />
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
            <Route path="/war-room" component={WarRoomPage} />
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
        </Suspense>

        {showAdBanner && (
          <div className={quietPage ? "mx-auto mt-6 w-full max-w-5xl px-3 md:px-5" : "mx-auto mt-8 w-full max-w-6xl px-4"}>
            <AdBanner
              label={quietPage ? "BallMtaani Matchday Support" : "BallMtaani Matchday Intelligence"}
              type="horizontal"
            />
          </div>
        )}

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
          <WelcomeModal />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
