"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, LayoutPanelTop, Workflow, FolderTree, Package,
  Shield, Sparkles, ChevronDown,
} from "lucide-react";
import { useLiveBuilder } from "@/context/LiveBuilderContext";
import FileTreePreview from "./FileTreePreview";
import StaticSitePreview from "./StaticSitePreview";
import ApiArchitecturePreview from "./ApiArchitecturePreview";
import SaasPreview from "./SaasPreview";
import FrontendPreview from "./FrontendPreview";
import AutomationPreview from "./AutomationPreview";
import AgentsPreview from "./AgentsPreview";
import DependencyPreview from "./DependencyPreview";
import VisualPreview from "./VisualPreview";
import GenerationDiff from "./GenerationDiff";

export default function LiveProjectBuilder() {
  const { state } = useLiveBuilder();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"visual" | "arch" | "flow" | "files" | "deps">("visual");

  const { projectType, projectName, aiMode, snapshot } = state;

  if (!projectType) return null;

  const aiModeLabel = aiMode === "agent_boost_100" ? "Agent Boost 100%"
    : "Local Build 90%";

  const aiModeColor = aiMode === "agent_boost_100" ? "text-violet-300 border-violet-500/30 bg-violet-500/10"
    : "text-emerald-300 border-emerald-500/30 bg-emerald-500/10";

  const tabs = [
    { key: "visual" as const, icon: Eye, label: "Preview", primary: true },
    { key: "arch" as const, icon: LayoutPanelTop, label: "Arquitetura" },
    { key: "flow" as const, icon: Workflow, label: "Fluxo" },
    { key: "files" as const, icon: FolderTree, label: "Arquivos", count: snapshot.files.length },
    { key: "deps" as const, icon: Package, label: "Dependências", count: snapshot.dependencies.length },
  ];

  const fileCount = snapshot.files.length;
  const moduleCount = snapshot.modules.length;
  const depCount = snapshot.dependencies.length;

  const renderVisualPreview = () => {
    switch (projectType) {
      case "static":
      case "static_site":
        return <StaticSitePreview components={snapshot.visualComponents} />;
      case "api":
        return <ApiArchitecturePreview components={snapshot.visualComponents} />;
      case "saas":
        return <SaasPreview components={snapshot.visualComponents} />;
      case "frontend":
        return <FrontendPreview components={snapshot.visualComponents} />;
      case "automation":
        return <AutomationPreview components={snapshot.visualComponents} />;
      case "agents":
        return <AgentsPreview components={snapshot.visualComponents} />;
      default:
        return <VisualPreview components={snapshot.visualComponents} />;
    }
  };

  const renderArchitecture = () => {
    if (snapshot.modules.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <LayoutPanelTop size={20} className="text-gray-600 mb-2" />
          <p className="text-xs text-gray-500">Nenhum módulo de arquitetura selecionado</p>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[10px] font-medium text-gray-400">Módulos da Arquitetura</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {snapshot.modules.map((mod, i) => (
            <motion.span
              key={mod}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 200 }}
              className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary border border-primary/20"
            >
              {mod}
            </motion.span>
          ))}
        </div>
        {snapshot.visualComponents.length > 0 && (
          <div className="mt-3">
            <p className="text-[9px] text-gray-500 mb-1.5">Camadas:</p>
            <VisualPreview components={snapshot.visualComponents} />
          </div>
        )}
      </div>
    );
  };

  const renderFlow = () => {
    if (projectType === "automation") {
      return <AutomationPreview components={snapshot.visualComponents} />;
    }
    if (projectType === "agents") {
      return <AgentsPreview components={snapshot.visualComponents} />;
    }
    if (projectType === "api") {
      return <ApiArchitecturePreview components={snapshot.visualComponents} />;
    }
    if (snapshot.modules.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Workflow size={20} className="text-gray-600 mb-2" />
          <p className="text-xs text-gray-500">Fluxo disponível para API, Automação e Agentes</p>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] font-medium text-gray-400">Fluxo de Dados</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {snapshot.modules.map((mod, i) => (
            <motion.div
              key={mod}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-1 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2"
            >
              <span className="text-[10px] font-medium text-gray-300">{mod}</span>
              {i < snapshot.modules.length - 1 && (
                <span className="text-[10px] text-gray-600 ml-1">→</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-80 shrink-0 pointer-events-auto">
      <motion.div
        initial={false}
        animate={{ width: collapsed ? 40 : 320 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="sticky top-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-surface/90 to-surface/60 backdrop-blur-xl shadow-xl shadow-black/20 overflow-hidden pointer-events-auto"
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
        >
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center">
                  <Sparkles size={12} className="text-white" />
                </div>
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-100">Projeto sendo montado</p>
                <p className="text-[9px] text-gray-500">ao vivo</p>
              </div>
            </div>
          )}
          {collapsed ? (
            <div className="flex flex-col items-center gap-1 w-full">
              <div className="h-5 w-5 rounded-lg bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center">
                <Sparkles size={10} className="text-white" />
              </div>
              <span className="text-[8px] text-emerald-400 font-bold">{fileCount}</span>
            </div>
          ) : (
            <ChevronDown size={14} className="text-gray-500" />
          )}
        </button>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3 space-y-3">
                <div className="flex items-center gap-2 text-[10px]">
                  <span className={`rounded-full px-2 py-0.5 font-medium border ${aiModeColor}`}>
                    {aiModeLabel}
                  </span>
                  {projectName && (
                    <span className="text-gray-500 truncate">{projectName}</span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
                    <p className="text-lg font-bold text-gray-100">{fileCount}</p>
                    <p className="text-[9px] text-gray-500">arquivos</p>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
                    <p className="text-lg font-bold text-gray-100">{moduleCount}</p>
                    <p className="text-[9px] text-gray-500">módulos</p>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2 text-center">
                    <p className="text-lg font-bold text-gray-100">{depCount}</p>
                    <p className="text-[9px] text-gray-500">deps</p>
                  </div>
                </div>

                <div className="flex gap-1 border-b border-white/[0.06]">
                  {tabs.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-1 px-2.5 py-2 text-[10px] font-medium transition-all border-b-2 ${
                        activeTab === tab.key
                          ? "text-primary border-primary"
                          : "text-gray-500 border-transparent hover:text-gray-300"
                      }`}
                    >
                      <tab.icon size={12} />
                      {tab.label}
                      {tab.count !== undefined && tab.count > 0 && (
                        <span className="rounded-full bg-primary/10 px-1.5 text-[8px] text-primary">{tab.count}</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="min-h-[180px] max-h-[420px] overflow-y-auto no-scrollbar">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                    >
                      {activeTab === "visual" && renderVisualPreview()}
                      {activeTab === "arch" && renderArchitecture()}
                      {activeTab === "flow" && renderFlow()}
                      {activeTab === "files" && (
                        <FileTreePreview structure={snapshot.structure} />
                      )}
                      {activeTab === "deps" && (
                        <DependencyPreview snapshot={snapshot} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-2 text-[9px] text-gray-600 pt-1 border-t border-white/[0.04]">
                  <Shield size={10} />
                  <span>Preview = contrato da geração</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
