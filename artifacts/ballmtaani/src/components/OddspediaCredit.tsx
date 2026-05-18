export default function OddspediaCredit({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://oddspedia.com"
      target="_blank"
      rel="nofollow noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45 transition-colors hover:text-white ${className}`}
    >
      <span className="inline-flex h-5 items-center rounded bg-white px-1.5 text-[9px] font-black tracking-normal text-[#111827]">
        Oddspedia
      </span>
      <span>Data powered by Oddspedia</span>
    </a>
  );
}
