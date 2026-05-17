"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, FileText } from "lucide-react";

interface Props {
  previewFiles: string[];
  generatedFiles: string[];
}

export default function GenerationDiff({ previewFiles, generatedFiles }: Props) {
  const missing = previewFiles.filter(f => !generatedFiles.includes(f) && !f.endsWith("/"));
  const extra = generatedFiles.filter(f => !previewFiles.includes(f));
  const matched = previewFiles.filter(f => generatedFiles.includes(f) || f.endsWith("/"));

  if (previewFiles.length === 0 && generatedFiles.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-xs text-gray-500">
        <FileText size={16} className="mr-2 text-gray-600" />
        Aguardando geração...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {matched.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-emerald-400 mb-1">
            ✓ {matched.length} arquivos correspondem
          </p>
          <div className="max-h-[160px] overflow-y-auto space-y-0.5">
            {matched.map((f) => (
              <div key={f} className="flex items-center gap-1.5 text-[11px] text-emerald-300/80">
                <CheckCircle size={10} className="text-emerald-500 shrink-0" />
                <span className="truncate">{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {missing.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-[10px] font-semibold text-rose-400 mb-1">
            ✗ {missing.length} arquivos faltando
          </p>
          <div className="max-h-[120px] overflow-y-auto space-y-0.5">
            {missing.map((f) => (
              <div key={f} className="flex items-center gap-1.5 text-[11px] text-rose-300/80">
                <XCircle size={10} className="text-rose-500 shrink-0" />
                <span className="truncate">{f}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {extra.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-amber-400 mb-1">
            + {extra.length} extras gerados
          </p>
          <div className="max-h-[80px] overflow-y-auto space-y-0.5">
            {extra.map((f) => (
              <div key={f} className="flex items-center gap-1.5 text-[11px] text-amber-300/60">
                <FileText size={10} className="text-amber-500 shrink-0" />
                <span className="truncate">{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
