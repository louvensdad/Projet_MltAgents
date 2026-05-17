"use client";

import RecommendationCard from "./RecommendationCard";
import WarningCard from "./WarningCard";

interface Props {
  suggestions: string[];
  warnings: string[];
}

export default function SmartAssistant({ suggestions, warnings }: Props) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-primary">Smart AI Assistant</p>
      <div className="mt-3 space-y-2">
        {suggestions.map((item) => <RecommendationCard key={item} text={item} />)}
        {warnings.map((item) => <WarningCard key={item} text={item} />)}
      </div>
    </div>
  );
}
