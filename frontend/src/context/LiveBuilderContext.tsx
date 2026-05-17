"use client";

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { BuilderProjectType, BuilderSnapshot } from "@/lib/live-builder";

export interface LiveBuilderState {
  projectType: BuilderProjectType | null;
  projectName: string;
  aiMode: "local_build_90" | "agent_boost_100";
  snapshot: BuilderSnapshot;
  fileCount: number;
  moduleCount: number;
  depCount: number;
}

interface LiveBuilderContextProps {
  state: LiveBuilderState;
  initProject: (type: BuilderProjectType, name?: string) => void;
  updateSnapshot: (snapshot: BuilderSnapshot) => void;
  setProjectName: (name: string) => void;
  setAiMode: (mode: "local_build_90" | "agent_boost_100") => void;
  getTrace: () => Record<string, any> | null;
}

const emptySnapshot: BuilderSnapshot = {
  files: [],
  modules: [],
  dependencies: [],
  docs: [],
  tests: [],
  structure: [],
  visualComponents: [],
};

const initialState: LiveBuilderState = {
  projectType: null,
  projectName: "",
  aiMode: "local_build_90",
  snapshot: emptySnapshot,
  fileCount: 0,
  moduleCount: 0,
  depCount: 0,
};

const LiveBuilderContext = createContext<LiveBuilderContextProps | undefined>(undefined);

export function LiveBuilderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LiveBuilderState>(initialState);

  const initProject = useCallback((type: BuilderProjectType, name?: string) => {
    setState(prev => ({
      ...prev,
      projectType: type,
      projectName: name || prev.projectName,
      snapshot: emptySnapshot,
      fileCount: 0,
      moduleCount: 0,
      depCount: 0,
    }));
  }, []);

  const updateSnapshot = useCallback((snapshot: BuilderSnapshot) => {
    setState(prev => ({
      ...prev,
      snapshot,
      fileCount: snapshot.files.length,
      moduleCount: snapshot.modules.length,
      depCount: snapshot.dependencies.length,
    }));
  }, []);

  const setProjectName = useCallback((name: string) => {
    setState(prev => ({ ...prev, projectName: name }));
  }, []);

  const setAiMode = useCallback((mode: "local_build_90" | "agent_boost_100") => {
    setState(prev => ({ ...prev, aiMode: mode }));
  }, []);

  const getTrace = useCallback(() => {
    if (!state.projectType) return null;
    return {
      generated_at: new Date().toISOString(),
      project_name: state.projectName,
      project_type: state.projectType,
      ai_mode: state.aiMode,
      live_builder_snapshot: {
        files: state.snapshot.files,
        modules: state.snapshot.modules,
        dependencies: state.snapshot.dependencies,
        docs: state.snapshot.docs,
        tests: state.snapshot.tests,
      },
    };
  }, [state]);

  return (
    <LiveBuilderContext.Provider value={{ state, initProject, updateSnapshot, setProjectName, setAiMode, getTrace }}>
      {children}
    </LiveBuilderContext.Provider>
  );
}

export function useLiveBuilder() {
  const context = useContext(LiveBuilderContext);
  if (!context) throw new Error("useLiveBuilder must be used within LiveBuilderProvider");
  return context;
}
