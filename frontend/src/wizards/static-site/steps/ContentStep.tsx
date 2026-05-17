"use client";

interface Props {
  projectName: string;
  targetAudience: string;
  businessGoal: string;
  onChange: (field: "project_name" | "target_audience" | "business_goal", value: string) => void;
}

function Field({ label, value, onChange, placeholder, multiline = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; multiline?: boolean }) {
  const className = "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-cyan-400/40 focus:bg-white/[0.05]";
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{label}</span>
      {multiline ? (
        <textarea className={`${className} min-h-28`} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input className={className} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </label>
  );
}

export default function ContentStep({ projectName, targetAudience, businessGoal, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-gray-200">Project context</p>
        <p className="text-xs text-gray-500">These fields feed the Prompt Master and the generator contract.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Project name" value={projectName} onChange={(value) => onChange("project_name", value)} placeholder="Acme Studio" />
        <Field label="Target audience" value={targetAudience} onChange={(value) => onChange("target_audience", value)} placeholder="Small businesses, startups, agencies" />
      </div>
      <Field label="Business goal" value={businessGoal} onChange={(value) => onChange("business_goal", value)} placeholder="Generate leads and present the offer clearly" multiline />
    </div>
  );
}
