import { type ReactNode, useEffect, useRef, useState } from "react";

export default function DeferredSection({
  children,
  minHeight = 320,
  rootMargin = "600px 0px",
}: {
  children: ReactNode;
  minHeight?: number;
  rootMargin?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    if (!("IntersectionObserver" in window)) {
      setReady(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setReady(true);
      observer.disconnect();
    }, { rootMargin });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [ready, rootMargin]);

  return (
    <div ref={containerRef} aria-busy={!ready} style={!ready ? { minHeight } : undefined}>
      {ready ? children : (
        <div className="mx-auto flex h-full min-h-[inherit] max-w-6xl items-center px-4 py-12">
          <div className="h-24 w-full animate-pulse rounded-2xl border border-white/5 bg-white/[0.025]" />
        </div>
      )}
    </div>
  );
}
