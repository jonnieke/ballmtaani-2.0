import { Route, Switch, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { LoginModal } from "./components/LoginModal";

import HomePage from "./pages/HomePage";
import MatchesPage from "./pages/MatchesPage";
import PredictionsPage from "./pages/PredictionsPage";
import DebatesPage from "./pages/DebatesPage";
import FanZonesPage from "./pages/FanZonesPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div className="min-h-screen bg-[#0B0B0B] text-white font-sans overflow-x-hidden selection:bg-[#B30000] selection:text-white">
            <Navbar />
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/matches" component={MatchesPage} />
              <Route path="/predictions" component={PredictionsPage} />
              <Route path="/debates" component={DebatesPage} />
              <Route path="/fan-zones" component={FanZonesPage} />
              <Route path="/leaderboard" component={LeaderboardPage} />
              <Route path="/profile" component={ProfilePage} />
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
            
            <LoginModal />
          </div>
        </WouterRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
