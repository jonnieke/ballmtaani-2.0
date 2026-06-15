export default function OddspediaCredit({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://oddspedia.com"
      target="_blank"
      rel="nofollow noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/55 transition-colors hover:text-white ${className}`}
    >
      <img
        src="https://widgets.oddspedia.com/images/logo-oddspedia-light.svg"
        alt="Oddspedia"
        className="h-4 w-auto"
        loading="lazy"
      />
      <span>Data powered by Oddspedia</span>
    </a>
  );
}
