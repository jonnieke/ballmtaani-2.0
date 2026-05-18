import { Link } from "wouter";
import { Activity, ArrowLeft, BarChart3, Brain, LineChart, Radio, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import SEO from "../components/SEO";
import OddspediaWidgetSlot from "../components/OddspediaWidgetSlot";
import OddspediaCredit from "../components/OddspediaCredit";

const INTELLIGENCE_CARDS = [
  {
    icon: Brain,
    title: "Fan vs Market",
    body: "See when fans believe harder than the numbers.",
    tone: "border-primary/45 text-primary",
  },
  {
    icon: LineChart,
    title: "Movement Signals",
    body: "Spot late shifts before kickoff.",
    tone: "border-blue-400/45 text-blue-300",
  },
  {
    icon: Activity,
    title: "Upset Watch",
    body: "Find matches where the story feels bigger than the table.",
    tone: "border-[#FFD700]/45 text-[#FFD700]",
  },
  {
    icon: ShieldCheck,
    title: "Clean Match Context",
    body: "Scores, signals and storylines in one place.",
    tone: "border-green-400/45 text-green-300",
  },
];

const ODDSPEDIA_API_TOKEN = "351d6b26a32409cc0db279adb48300f55efdb08627bdd3a653c84cedd297";

const footballLiveScoreConfig = {
  api_token: ODDSPEDIA_API_TOKEN,
  type: "live-score",
  domain: "ballmtaani.com",
  selector: "oddspedia-widget-live-score-popular-false-sports-football-leagues-false",
  width: "0",
  theme: "1",
  odds_type: "1",
  language: "en",
  primary_color: "#323840",
  accent_color: "#00B1FF",
  font: "Roboto",
  logos: "true",
  inplay_only: "false",
  extended_match_info: "true",
  live_stream: "true",
  limit: "15",
  popular: "false",
  sports: "football",
  leagues: "",
};

const competitionLeagueConfig = {
  api_token: ODDSPEDIA_API_TOKEN,
  type: "competition",
  domain: "ballmtaani.com",
  selector: "oddspedia-widget-competition-league-3",
  width: "0",
  theme: "0",
  odds_type: "1",
  language: "en",
  primary_color: "#0369C7",
  accent_color: "#000000",
  font: "Roboto",
  league_id: "3",
  limit: "8",
  show_odds: "true",
};

const matchCenterConfig = {
  api_token: ODDSPEDIA_API_TOKEN,
  match_id: "10077589",
  type: "match-center",
  domain: "ballmtaani.com",
  selector: "oddspedia-widget-match-center-10077589",
  width: "0",
  theme: "0",
  odds_type: "1",
  language: "en",
  primary_color: "#283E5B",
  primary_color_opacity: "0.9",
  secondary_color: "#53647B",
  accent_color: "#00B1FF",
  font: "Roboto",
  logos: "true",
  image: "true",
  best_odds: "true",
  header: "true",
  odds: "true",
  featured_bookie: "0",
  limitVisibleOperators: "15",
};

export default function MarketWatchPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070a0f] pb-24 text-white">
      <SEO
        title="Market Watch | BallMtaani Football Intelligence"
        description="Football market intelligence for BallMtaani fans: sentiment, movement signals, match context and fan-vs-market comparisons."
      />

      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1800&q=80"
          alt=""
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(239,35,48,0.5),transparent_24%),radial-gradient(circle_at_18%_20%,rgba(42,130,255,0.22),transparent_28%),linear-gradient(180deg,rgba(7,10,15,0.62),#070a0f_76%)]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
        <Link href="/matches" className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm font-bold text-white/75 backdrop-blur-xl transition-colors hover:border-primary/60 hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Data Center
        </Link>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.26em] text-primary">Football market pulse</p>
            <h1 className="max-w-3xl text-4xl font-bold italic leading-none md:text-6xl">
              Know the match before kickoff.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/66">
              Follow live scores, form signals, market movement and fan confidence across the matches that matter.
            </p>
          </div>

          <div className="rounded-3xl border border-white/12 bg-[#0c121b]/82 p-4 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/35 bg-primary/12 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold uppercase text-white">Matchday Signals</h2>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/42">Sharper football context</p>
              </div>
            </div>
            <div className="grid gap-2 text-sm leading-6 text-white/58">
              <p>Track momentum before kickoff and during live matches.</p>
              <p>Compare fan confidence with market movement.</p>
              <p>Jump into deeper match context when the story gets hot.</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {INTELLIGENCE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className={`rounded-2xl border bg-[#0d131c]/86 p-4 ${card.tone}`}>
                <Icon className="mb-3 h-6 w-6" />
                <h3 className="text-sm font-bold uppercase text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/52">{card.body}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_1fr]">
          <OddspediaWidgetSlot
            title="Live Football Market Pulse"
            description="Live football scores, match context and movement signals for the games fans are following now."
            preferredWidget="Oddspedia Livescore / Odds Comparison"
            widgetKey="market-pulse"
            selector="oddspedia-widget-live-score-popular-false-sports-football-leagues-false"
            globalName="oddspediaWidgetLiveScorePopularSportsfootballLeagues"
            widgetId="oddspediaWidgetLiveScorePopularSportsfootballLeagues"
            config={footballLiveScoreConfig}
          />
          <OddspediaWidgetSlot
            title="Competition Intelligence"
            description="Fixtures, standings, results and competition trends for a selected league."
            preferredWidget="Oddspedia Competition"
            widgetKey="competition-league"
            selector="oddspedia-widget-competition-league-3"
            globalName="oddspediaWidgetCompetitionLeague3"
            widgetId="oddspediaWidgetCompetitionLeague3"
            config={competitionLeagueConfig}
          />
          <div className="xl:col-span-2">
            <OddspediaWidgetSlot
              title="Match Center Intelligence"
              description="Scoreboard, team context and live match movement in one focused view."
              preferredWidget="Oddspedia Match Center"
              widgetKey="match-center"
              selector="oddspedia-widget-match-center-10077589"
              globalName="oddspediaWidgetMatchCenter10077589"
              widgetId="oddspediaWidgetMatchCenter10077589"
              config={matchCenterConfig}
            />
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-[#0c121b]/88 p-4 backdrop-blur-xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold uppercase text-white">What To Watch</h2>
              <p className="mt-1 text-sm text-white/50">Quick ways fans can read the match beyond the scoreline.</p>
            </div>
            <BarChart3 className="h-7 w-7 text-primary" />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-black/22 p-4">
              <Radio className="mb-3 h-5 w-5 text-primary" />
              <h3 className="font-bold uppercase text-white">Today’s heat</h3>
              <p className="mt-2 text-sm leading-6 text-white/52">Which fixtures are getting attention before kickoff?</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/22 p-4">
              <Activity className="mb-3 h-5 w-5 text-[#FFD700]" />
              <h3 className="font-bold uppercase text-white">Live swings</h3>
              <p className="mt-2 text-sm leading-6 text-white/52">Which match is shifting fast as goals, cards and subs land?</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/22 p-4">
              <Trophy className="mb-3 h-5 w-5 text-blue-300" />
              <h3 className="font-bold uppercase text-white">Tournament pulse</h3>
              <p className="mt-2 text-sm leading-6 text-white/52">Follow long-term storylines across leagues and WC26.</p>
            </div>
          </div>
        </section>

        <footer className="mt-6 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-white/38">
          <OddspediaCredit />
          <div className="mt-3">BallMtaani does not process bets.</div>
        </footer>
      </main>
    </div>
  );
}
