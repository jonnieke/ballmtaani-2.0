/**
 * BallMtaani Club Partner Portal (/club-partner)
 * Secure management portal for verified football clubs to post official announcements and fan polls.
 */

import React, { useState } from "react";
import SEO from "../components/SEO";

interface ClubAnnouncement {
  id: string;
  title: string;
  category: "Squad Update" | "Transfer News" | "Matchday Notice";
  status: "in_review" | "published";
  submittedAt: string;
}

export default function ClubPartnerPortalPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"Squad Update" | "Transfer News" | "Matchday Notice">("Squad Update");
  const [announcements, setAnnouncements] = useState<ClubAnnouncement[]>([
    {
      id: "ANN-101",
      title: "Gor Mahia FC Official Squad Announcement for Mashemeji Derby",
      category: "Squad Update",
      status: "published",
      submittedAt: new Date(Date.now() - 86400000).toLocaleDateString(),
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newAnnouncement: ClubAnnouncement = {
      id: `ANN-${Math.floor(Math.random() * 1000)}`,
      title,
      category,
      status: "in_review",
      submittedAt: new Date().toLocaleDateString(),
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    setTitle("");
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white py-10 px-4">
      <SEO
        title="Official Club Partner Portal | BallMtaani"
        description="Portal for verified football clubs to manage official announcements and fan sentiment tools."
        noindex
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-[#FFD700] text-black text-[10px] font-black uppercase tracking-widest">
                VERIFIED CLUB PARTNER
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black uppercase text-white mt-1">
              Gor Mahia FC (K'Ogalo) Partner Hub
            </h1>
          </div>
        </div>

        {/* Create Announcement Form */}
        <div className="bg-[#111319] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#FFD700]">
            SUBMIT OFFICIAL CLUB ANNOUNCEMENT
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-white/70 mb-1 font-semibold">Announcement Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Gor Mahia FC signs new striker ahead of continental fixtures..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#FFD700]"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-white/70 mb-1 font-semibold">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#181d2a] border border-white/15 text-xs text-white focus:outline-none focus:border-[#FFD700]"
              >
                <option value="Squad Update">Squad Update</option>
                <option value="Transfer News">Transfer News</option>
                <option value="Matchday Notice">Matchday Notice</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#B30000] text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors shadow-lg"
            >
              Submit for Editorial Approval
            </button>
          </form>
        </div>

        {/* Existing Announcements */}
        <div className="bg-[#111319] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-white">
            RECENT CLUB ANNOUNCEMENTS
          </h2>

          <div className="space-y-3">
            {announcements.map(ann => (
              <div key={ann.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <h3 className="text-xs font-bold text-white">{ann.title}</h3>
                  <span className="text-[10px] text-white/50">{ann.category} • Submitted {ann.submittedAt}</span>
                </div>
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  ann.status === "published" ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40" : "bg-amber-950 text-amber-400 border border-amber-500/40"
                }`}>
                  {ann.status === "published" ? "Published" : "In Review"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
