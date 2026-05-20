type DataFreshnessChipProps = {
  label: string;
  className?: string;
};

export default function DataFreshnessChip({ label, className = "" }: DataFreshnessChipProps) {
  return (
    <p className={`text-[11px] font-medium text-white/55 ${className}`.trim()}>
      {label}
    </p>
  );
}

