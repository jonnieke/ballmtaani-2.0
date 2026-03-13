import React from "react";

export const SkeletonMatch = () => (
  <div className="snap-start shrink-0 w-[300px] rounded-xl bg-white/5 border border-white/10 p-4 animate-pulse">
    <div className="flex justify-between items-center mb-3">
      <div className="h-2 w-16 bg-white/10 rounded"></div>
      <div className="h-4 w-12 bg-white/10 rounded"></div>
    </div>
    <div className="grid grid-cols-2 gap-4 mt-6">
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-white/10"></div>
        <div className="h-2 w-12 bg-white/10 rounded"></div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-white/10"></div>
        <div className="h-2 w-12 bg-white/10 rounded"></div>
      </div>
    </div>
  </div>
);

export const SkeletonDebate = () => (
  <div className="bg-white/5 rounded-xl border border-white/10 p-6 animate-pulse">
    <div className="h-6 w-3/4 bg-white/10 rounded mx-auto mb-6"></div>
    <div className="flex justify-between mb-2">
      <div className="h-3 w-16 bg-white/10 rounded"></div>
      <div className="h-3 w-16 bg-white/10 rounded"></div>
    </div>
    <div className="h-10 w-full bg-white/5 rounded-lg mb-6"></div>
    <div className="flex gap-4">
      <div className="flex-1 h-10 bg-white/10 rounded-lg"></div>
      <div className="flex-1 h-10 bg-white/10 rounded-lg"></div>
    </div>
  </div>
);

export const SkeletonBanter = () => (
  <div className="bg-white/5 rounded-xl border border-white/10 p-5 animate-pulse mb-4">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 rounded-full bg-white/10"></div>
      <div className="space-y-2">
        <div className="h-2 w-20 bg-white/10 rounded"></div>
        <div className="h-2 w-12 bg-white/10 rounded"></div>
      </div>
    </div>
    <div className="h-3 w-full bg-white/10 rounded mb-2"></div>
    <div className="h-3 w-2/3 bg-white/10 rounded"></div>
  </div>
);
