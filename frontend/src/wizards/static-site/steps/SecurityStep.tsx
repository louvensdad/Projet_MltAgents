"use client";

interface Props {
  cspEnabled: boolean;
  jsSanitization: boolean;
  unsafeLinkProtection: boolean;
  noCredentialsFrontend: boolean;
  formValidation: boolean;
  onChange: (field: string, value: boolean) => void;
  t: (k: string) => string;
}

function Toggle({ active, onClick, label, desc }: { active: boolean; onClick: () => void; label: string; desc?: string }) {
  return (
    <div onClick={onClick} className={`flex cursor-pointer items-center gap-4 rounded-xl border p-5 transition-all ${
      active ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/10 text-gray-400 hover:border-white/30"
    }`}>
      <div className={`h-6 w-12 rounded-full transition-colors ${active ? "bg-emerald-500" : "bg-white/20"}`}>
        <div className={`h-6 w-6 rounded-full bg-white transition-transform shadow ${active ? "translate-x-6" : ""}`} />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-semibold ${active ? "text-emerald-300" : "text-gray-300"}`}>{label}</p>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
    </div>
  );
}

export default function SecurityStep(props: Props) {
  const { t, onChange } = props;
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-200">{t("wizard.static.security_title")}</p>
      <div className="space-y-3">
        <Toggle active={props.cspEnabled} onClick={() => onChange("csp_enabled", !props.cspEnabled)} label={t("wizard.static.csp_enabled")} desc={t("wizard.static.csp_enabled_desc")} />
        <Toggle active={props.jsSanitization} onClick={() => onChange("js_sanitization", !props.jsSanitization)} label={t("wizard.static.js_sanitization")} desc={t("wizard.static.js_sanitization_desc")} />
        <Toggle active={props.unsafeLinkProtection} onClick={() => onChange("unsafe_link_protection", !props.unsafeLinkProtection)} label={t("wizard.static.unsafe_link_protection")} desc={t("wizard.static.unsafe_link_protection_desc")} />
        <Toggle active={props.noCredentialsFrontend} onClick={() => onChange("no_credentials_frontend", !props.noCredentialsFrontend)} label={t("wizard.static.no_credentials_frontend")} desc={t("wizard.static.no_credentials_frontend_desc")} />
        <Toggle active={props.formValidation} onClick={() => onChange("form_validation", !props.formValidation)} label={t("wizard.static.form_validation")} desc={t("wizard.static.form_validation_desc")} />
      </div>
    </div>
  );
}
