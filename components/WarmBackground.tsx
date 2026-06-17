"use client";

export default function WarmBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="warm-orb warm-orb-1" />
      <div className="warm-orb warm-orb-2" />
      <div className="warm-orb warm-orb-3" />
      <div className="warm-orb warm-orb-4" />
      <div className="warm-orb warm-orb-5" />
    </div>
  );
}
