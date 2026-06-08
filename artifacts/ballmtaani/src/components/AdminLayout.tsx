import { Link, useLocation } from "wouter";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, FileText, Megaphone, Users, FlaskConical, ChevronRight, ShieldCheck } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/articles", label: "Articles", icon: FileText },
  { href: "/admin/ads", label: "Ads", icon: Megaphone },
  { href: "/admin/partners", label: "Partners", icon: Users },
  { href: "/admin/roles", label: "Roles", icon: ShieldCheck },
  { href: "/diagnostics", label: "Diagnostics", icon: FlaskConical },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = useIsAdmin();
  const { isLoggedIn } = useAuth();
  const [location, navigate] = useLocation();

  if (!isLoggedIn) { navigate("/login"); return null; }
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0B0B0B]">
        <p className="text-2xl font-black text-[#B30000]">Access Denied</p>
        <Link href="/" className="text-sm text-white/40 hover:text-white">← Back to home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a0f]">
      {/* Top bar */}
      <div className="border-b border-white/6 bg-[#0B0B0B] px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white">
              Ball<span className="text-[#B30000]">Mtaani</span>
            </Link>
            <ChevronRight className="h-3 w-3 text-white/15" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Admin</span>
          </div>
          <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-white/25 hover:text-white">
            ← Exit Admin
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden w-44 shrink-0 lg:block">
            <nav className="space-y-0.5">
              {NAV.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? location === href : location.startsWith(href);
                return (
                  <Link key={href} href={href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[11px] font-black uppercase tracking-widest transition-all
                      ${active ? "bg-white/8 text-white" : "text-white/30 hover:bg-white/5 hover:text-white/70"}`}>
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Mobile tab bar */}
          <div className="mb-4 flex w-full gap-1 lg:hidden">
            {NAV.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? location === href : location.startsWith(href);
              return (
                <Link key={href} href={href}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-[8px] font-black uppercase tracking-widest transition-all
                    ${active ? "bg-white/8 text-white" : "text-white/25 hover:text-white/60"}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Content */}
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
