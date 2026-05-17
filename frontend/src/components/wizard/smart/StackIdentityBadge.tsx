"use client";

import { StackProfile } from "@/lib/stackProfiles";

export default function StackIdentityBadge({ profile }: { profile: StackProfile }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${profile.identity.accent}`} />
      <p className="mt-3 text-xs font-bold uppercase tracking-widest text-gray-400">{profile.name}</p>
      <p className="mt-1 text-sm font-semibold text-white">{profile.identity.tone}</p>
      <p className="mt-1 text-xs text-gray-400">{profile.identity.highlight}</p>
    </div>
  );
}
