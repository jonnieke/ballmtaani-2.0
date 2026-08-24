import React, { useState } from "react";
import { Link } from "wouter";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { GRASSROOTS_TALENTS, GrassrootsTalent } from "../../lib/talanta/talanta-data";
import TalentScoutCard from "../../components/talanta/TalentScoutCard";
import { Sparkles, Award, Search, PlusCircle, ShieldCheck, Heart, ArrowRight, CheckCircle2, User, Mic } from "lucide-react";
import RouteSEO from "../../components/RouteSEO";

export default function TalantaMtaaniPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNominateModal, setShowNominateModal] = useState(false);
  const [submittedNomination, setSubmittedNomination] = useState(false);

  const [nomName, setNomName] = useState("");
  const [nomSchool, setNomSchool] = useState("");
  const [nomPosition, setNomPosition] = useState("Striker");
  const [nomRegion, setNomRegion] = useState("");
  const [nomContact, setNomContact] = useState("");

  const filteredTalents = GRASSROOTS_TALENTS.filter((talent) => {
    const matchesCat = selectedCategory === "all" || talent.category === selectedCategory;
    const matchesSearch =
      talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.position.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleNominateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedNomination(true);
    setTimeout(() => {
      setShowNominateModal(false);
      setSubmittedNomination(false);
      setNomName("");
      setNomSchool("");
      setNomRegion("");
      setNomContact("");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20">
      <RouteSEO path="/talanta" />

      {/* Hero Header */}
      <div className="border-b border-white/10 bg-gradient-to-b from-[#121212] via-[#0A0A0A] to-[#0A0A0A] px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl text-center space-y-4">
          <Badge className="mx-auto inline-flex border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5 mr-1" /> Talanta Mtaani — Grassroots &amp; School Talent Radar
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Spotlighting Kenya's Future Stars,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              From High Schools to the Big Stage.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-gray-300 leading-relaxed">
            Mainstream media misses raw grassroots talent. BallMtaani puts the spotlight on school prodigies (KSSSA), NSL fighters, and mtaa heroes. Verified with scouting reviews by active FKF-PL pros like Derrick Okach.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => setShowNominateModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs shadow-lg"
            >
              <PlusCircle className="h-4 w-4 mr-1.5" /> Nominate a Rising Talent
            </Button>

            <Link href="/insider/derrick-okach">
              <Button variant="outline" className="border-red-500/30 text-white hover:bg-red-950/20 font-bold text-xs">
                🎙️ Derrick Okach (Shabana FC) Insider Hub <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* Derrick Okach Pro Contributor Banner */}
        <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/30 via-[#141414] to-[#121212] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-600 text-white font-black flex items-center justify-center text-base shadow-lg shrink-0">
              DO
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white">Scouted &amp; Verified with Derrick Okach</h4>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[9px]">
                  Shabana FC
                </Badge>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                "We play against or watch these kids in off-season tournaments. Their hunger is real." — Derrick Okach
              </p>
            </div>
          </div>

          <Link href="/insider/derrick-okach">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 shrink-0 shadow-md">
              Listen to Locker Room Audio <Mic className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        {/* Filter Categories & Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: "all", label: "All Rising Stars" },
                { id: "ksssa", label: "🏫 KSSSA High Schools" },
                { id: "academy", label: "⚽ Academies & NSL" },
                { id: "county", label: "🌍 County Leagues" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search talent, school or region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Talent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTalents.map((talent) => (
            <TalentScoutCard key={talent.id} talent={talent} />
          ))}
        </div>
      </div>

      {/* Nomination Modal */}
      {showNominateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#121212] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-black text-white">Nominate a Grassroots Talent</h3>
                <p className="text-xs text-gray-400">Put your schoolmate or local mtaa star on the radar</p>
              </div>
              <button
                onClick={() => setShowNominateModal(false)}
                className="text-gray-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            {submittedNomination ? (
              <div className="p-6 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-white">Nomination Submitted!</h4>
                <p className="text-xs text-gray-300">
                  Our scouting desk and athlete contributors will review the player's stats and verify their profile.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNominateSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Player Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Victor Omondi"
                    value={nomName}
                    onChange={(e) => setNomName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">School / Academy</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Kakamega High"
                      value={nomSchool}
                      onChange={(e) => setNomSchool(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Position</label>
                    <select
                      value={nomPosition}
                      onChange={(e) => setNomPosition(e.target.value)}
                      className="w-full bg-[#1e1e1e] border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Striker">Striker</option>
                      <option value="Winger">Winger</option>
                      <option value="Central Midfielder">Central Midfielder</option>
                      <option value="Defensive Midfielder">Defensive Midfielder</option>
                      <option value="Center Back">Center Back</option>
                      <option value="Full Back">Full Back</option>
                      <option value="Goalkeeper">Goalkeeper</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Region / County</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Kisii / Nairobi"
                      value={nomRegion}
                      onChange={(e) => setNomRegion(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1">Coach/Contact Phone</label>
                    <input
                      required
                      type="text"
                      placeholder="07..."
                      value={nomContact}
                      onChange={(e) => setNomContact(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold text-xs h-10 mt-2">
                  Submit Talent for Scouting Review
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
