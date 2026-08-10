import { Link } from "wouter";

type EditorialIntroProps = {
  eyebrow: string;
  title: string;
  copy: string;
  bullets: string[];
  links?: Array<{ href: string; label: string }>;
};

export default function EditorialIntro({ eyebrow, title, copy, bullets, links = [] }: EditorialIntroProps) {
  return (
    <section className="border-b border-white/8 bg-[#090b12] py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-[1.75rem] border border-white/10 bg-[#0d1018] p-5 md:p-6">
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#FFD700]/80">{eyebrow}</p>
          <div className="mt-2 grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <h2 className="text-2xl font-black leading-tight text-white md:text-3xl">{title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/48">{copy}</p>
              {links.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {links.map((link) => (
                    <Link key={link.href} href={link.href} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/65 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {bullets.map((bullet) => (
                <div key={bullet} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-[#FFD700]" />
                  <p className="text-sm leading-6 text-white/70">{bullet}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
