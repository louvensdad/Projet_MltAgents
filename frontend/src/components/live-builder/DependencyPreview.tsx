"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Package, BookOpen, TestTube, Shield } from "lucide-react";
import type { BuilderSnapshot } from "@/lib/live-builder";

interface Props {
  snapshot: BuilderSnapshot;
}

export default function DependencyPreview({ snapshot }: Props) {
  const hasDeps = snapshot.dependencies.length > 0;
  const hasDocs = snapshot.docs.length > 0;
  const hasTests = snapshot.tests.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-[10px] font-medium text-gray-400">Dependências & Contrato</span>
      </div>

      <AnimatePresence mode="popLayout">
        {hasDeps && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1.5"
          >
            <p className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
              <Package size={10} /> Dependências
            </p>
            <div className="flex flex-wrap gap-1">
              {snapshot.dependencies.map((dep) => (
                <motion.span
                  key={dep}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="rounded-md bg-white/[0.04] border border-white/[0.06] px-2 py-1 text-[9px] text-gray-400 font-mono"
                >
                  {dep}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {hasDocs && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1.5"
          >
            <p className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
              <BookOpen size={10} /> Documentação
            </p>
            <div className="space-y-0.5">
              {snapshot.docs.map((doc) => (
                <motion.div
                  key={doc}
                  initial={{ x: -8, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-1.5 text-[10px] text-gray-500"
                >
                  <BookOpen size={8} className="text-gray-600" />
                  {doc}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {hasTests && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1.5"
          >
            <p className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
              <TestTube size={10} /> Testes
            </p>
            <div className="space-y-0.5">
              {snapshot.tests.map((test) => (
                <motion.div
                  key={test}
                  initial={{ x: -8, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-1.5 text-[10px] text-gray-500"
                >
                  <TestTube size={8} className="text-gray-600" />
                  {test}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {!hasDeps && !hasDocs && !hasTests && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-6 text-center"
          >
            <Shield size={16} className="text-gray-600 mb-2" />
            <p className="text-[11px] text-gray-500">Nenhuma dependência adicional</p>
            <p className="text-[9px] text-gray-600">Ao selecionar módulos, deps aparecerão aqui</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 text-[8px] text-gray-600 pt-1 border-t border-white/[0.04]">
        <Shield size={8} />
        <span>Preview = contrato da geração — tudo aqui será gerado</span>
      </div>
    </div>
  );
}
