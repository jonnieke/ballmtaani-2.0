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

// ─── Stale-chunk guard ────────────────────────────────────────────────────────
// After a Vercel deploy, old content-hashed chunk filenames (e.g. MatchesPage-Dn2FWjK6.js)
// no longer exist. If a lazy import 404s, do one hard reload to pick up the new
// HTML (which references the new filenames). A sessionStorage flag stops loops.
function lazyPage<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await importFn();
    } catch {
      const KEY = "chunk_reload_attempted";
      if (!sessionStorage.getItem(KEY)) {
        sessionStorage.setItem(KEY, "1");
        window.location.reload();
        return new Promise(() => {}); // block — reload is in flight
      }
      sessionStorage.removeItem(KEY);
      throw new Error("Chunk load failed after reload — please hard-refresh (Ctrl+Shift+R).");
    }
  });
}

// ─── Route-level code splitting ───────────────────────────────────────────────
// Each page is loaded only when navigated to — reduces initial bundle by ~50%
// LandingPage and HomePage are eagerly loaded (most visited, need fast paint)
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/MarketHomePage";

const DataCentrePage     = lazyPage(() => import("./pages/DataCentrePage"));
const MatchesPage        = lazyPage(() => import("./pages/MatchesPage"));
const PredictionsPage    = lazyPage(() => import("./pages/PredictionsPage"));
const DebatesPage        = lazyPage(() => import("./pages/DebatesPage"));
const FanZonesPage       = lazyPage(() => import("./pages/FanZonesPage"));
const LeaderboardPage    = lazyPage(() => import("./pages/LeaderboardPage"));
const ProfilePage        = lazyPage(() => import("./pages/ProfilePage"));
const StorePage          = lazyPage(() => import("./pages/StorePage"));
const LiveCenterPage     = lazyPage(() => import("./pages/LiveCenterPage"));
const LiveCenterIndexPage= lazyPage(() => import("./pages/LiveCenterIndexPage"));
const RivalriesPage      = lazyPage(() => import("./pages/RivalriesPage"));
const RapidFirePage      = lazyPage(() => import("./pages/RapidFirePage"));
const FunZonePage        = lazyPage(() => import("./pages/FunZonePage"));
const TriviaPage         = lazyPage(() => import("./pages/TriviaPage"));
const WarRoomPage        = lazyPage(() => import("./pages/WarRoomPage"));
const DiagnosticsPage    = lazyPage(() => import("./pages/DiagnosticsPage"));
const TermsPage          = lazyPage(() => import("./pages/TermsPage"));
const PrivacyPage        = lazyPage(() => import("./pages/PrivacyPage"));
const AboutPage          = lazyPage(() => import("./pages/AboutPage"));
const ContactPage        = lazyPage(() => import("./pages/ContactPage"));
const ArticlesPage       = lazyPage(() => import("./pages/ArticlesPage"));
const WorldCup2026Page   = lazyPage(() => import("./pages/WorldCup2026Page"));
const WorldCupGuidePage  = lazyPage(() => import("./pages/WorldCupGuidePage"));
const WorldCupBracketPage= lazyPage(() => import("./pages/WorldCupBracketPage"));
const AIFanZonePage      = lazyPage(() => import("./pages/AIFanZonePage"));
const MarketWatchPage    = lazyPage(() => import("./pages/MarketWatchPage"));
const MchambuziHalisiPage= lazyPage(() => import("./pages/MchambuziHalisiPage"));
const ArticlePage        = lazyPage(() => import("./pages/ArticlePage"));
const AdminDashboardPage = lazyPage(() => import("./pages/AdminDashboardPage"));
const AdminArticlesPage  = lazyPage(() => import("./pages/AdminArticlesPage"));
const AdminAdsPage       = lazyPage(() => import("./pages/AdminAdsPage"));
const AdminPartnersPage  = lazyPage(() => import("./pages/AdminPartnersPage"));
const AdminRolesPage     = lazyPage(() => import("./pages/AdminRolesPage"));
const AdminRewardsPage   = lazyPage(() => import("./pages/AdminRewardsPage"));
const AdminAnalyticsPage = lazyPage(() => import("./pages/AdminAnalyticsPage"));
const SearchPage         = lazyPage(() => import("./pages/SearchPage"));
const NewsPage           = lazyPage(() => import("./pages/NewsPage"));
const VideosPage         = lazyPage(() => import("./pages/VideosPage"));
const LoginPage          = lazyPage(() => import("./pages/auth/LoginPage"));
const VerifyOTPPage      = lazyPage(() => import("./pages/auth/OTPPage"));
const AuthCallbackPage   = lazy(() => import("./pages/auth/AuthCallbackPage"));
import WelcomeModal from "./components/WelcomeModal";
import ProfileSetupModal from "./components/ProfileSetupModal";
import StickySignUpBanner from "./components/StickySignUpBanner";

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
      retry: 0,                    // Fallbacks handle failure — no retry hammering
      staleTime: 30_000,           // Don't refetch data younger than 30s (matches proxy burst cache)
      refetchOnWindowFocus: false, // Don't burst all queries when user switches tabs
    },
  },
});

function AppShell() {
  const [location] = useLocation();
  const { pendingLoginStreak, clearPendingLoginStreak } = useAuth();
  const normalizedLocation = location.replace(/\/+$/, "") || "/";
  const isWorldCupPage = normalizedLocation === "/world-cup-2026" || normalizedLocation.startsWith("/world-cup-2026/");
  const quietPage = ["/", "/hub", "/mchambuzi-halisi", "/login", "/verify", "/terms", "/privacy"].includes(normalizedLocation) || isWorldCupPage;
  const showInstallBanner = ["/", "/home", "/hub", "/world-cup-2026"].includes(normalizedLocation);
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
            <Route path="/" component={HomePage} />
            <Route path="/home" component={HomePage} />
            <Route path="/hub" component={LandingPage} />
            <Route path="/world-cup-2026" component={WorldCup2026Page} />
            <Route path="/world-cup-2026/bracket" component={WorldCupBracketPage} />
            <Route path="/world-cup-2026/:guide" component={WorldCupGuidePage} />
            <Route path="/ai-fan-zone" component={AIFanZonePage} />
            <Route path="/mchambuzi-halisi" component={MchambuziHalisiPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/verify" component={VerifyOTPPage} />
            <Route path="/auth/callback" component={AuthCallbackPage} />
            <Route path="/data-centre" component={DataCentrePage} />
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
            <Route path="/fun-zone" component={FunZonePage} />
            <Route path="/war-room" component={WarRoomPage} />
            <Route path="/trivia" component={TriviaPage} />
            <Route path="/diagnostics" component={DiagnosticsPage} />
            <Route path="/terms" component={TermsPage} />
            <Route path="/terms/" component={TermsPage} />
            <Route path="/terms-of-service" component={TermsPage} />
            <Route path="/privacy" component={PrivacyPage} />
            <Route path="/privacy/" component={PrivacyPage} />
            <Route path="/privacy-policy" component={PrivacyPage} />
            <Route path="/article/:slug" component={ArticlePage} />
            <Route path="/admin" component={AdminDashboardPage} />
            <Route path="/admin/articles" component={AdminArticlesPage} />
            <Route path="/admin/ads" component={AdminAdsPage} />
            <Route path="/admin/partners" component={AdminPartnersPage} />
            <Route path="/admin/roles" component={AdminRolesPage} />
            <Route path="/admin/rewards" component={AdminRewardsPage} />
            <Route path="/admin/analytics" component={AdminAnalyticsPage} />
            <Route path="/search" component={SearchPage} />
            <Route path="/news" component={NewsPage} />
            <Route path="/videos" component={VideosPage} />
            <Route path="/about" component={AboutPage} />
            <Route path="/contact" component={ContactPage} />
            <Route path="/articles" component={ArticlesPage} />
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

        <footer className={`${quietPage ? "mt-10" : "mt-20 border-t border-[#1B1B1B]"} bg-[#0B0B0B] py-10`}>
          <div className="max-w-6xl mx-auto px-4 text-center">
            {!quietPage && (
              <>
                <h3 className="text-xl font-black tracking-widest text-white uppercase mb-4">
                  Ball<span className="text-[#B30000]">Mtaani</span>
                </h3>
                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                  Kenyan football fans predicting, debating, and keeping receipts around the biggest matches.
                </p>
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mb-6 text-xs text-gray-600">
                  <a href="/about"   className="hover:text-gray-400 transition-colors">About</a>
                  <a href="/contact" className="hover:text-gray-400 transition-colors">Contact</a>
                  <a href="/news"    className="hover:text-gray-400 transition-colors">Mtaa Daily</a>
                  <a href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
                  <a href="/terms"   className="hover:text-gray-400 transition-colors">Terms</a>
                  <a href="mailto:info@ballmtaani.com" className="hover:text-gray-400 transition-colors">info@ballmtaani.com</a>
                </div>
              </>
            )}
            <p className="text-gray-600 text-xs">
              (c) {new Date().getFullYear()} BallMtaani. All rights reserved. MTC status points are platform engagement rewards with no monetary value.
            </p>
          </div>
        </footer>

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
          <ProfileSetupModal />
          <StickySignUpBanner />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
