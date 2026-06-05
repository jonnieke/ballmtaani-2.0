type DataFreshnessChipProps = {
  label: string;
  className?: string;
};

export default function DataFreshnessChip({ label, className = "" }: DataFreshnessChipProps) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 ${className}`.trim()}>
      <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_currentColor]" />
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">{label}</p>
    </div>
  );
}
