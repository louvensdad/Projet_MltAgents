"use client";

import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";
import {
  builderReducer, createInitialState, saveBuilderState, loadBuilderState,
  type BuilderState, type BuilderAction, type ElementType,
} from "./builderSchema";

interface VisualBuilderContextProps {
  state: BuilderState;
  dispatch: React.Dispatch<BuilderAction>;
  addElement: (type: ElementType, parentId?: string) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  updateProps: (id: string, props: Record<string, any>) => void;
  updateStyles: (id: string, styles: Record<string, string>) => void;
  updateContent: (id: string, content: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  duplicate: (id: string) => void;
  clearAll: () => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

const VisualBuilderContext = createContext<VisualBuilderContextProps | undefined>(undefined);

const STORAGE_KEY = "visual_builder_state";

export function VisualBuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(builderReducer, null, () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const loaded = loadBuilderState(saved);
        if (loaded) return loaded;
      }
    }
    return createInitialState();
  });

  const addElement = useCallback((type: ElementType, parentId?: string) => {
    dispatch({ type: "ADD_ELEMENT", elementType: type, parentId });
  }, []);

  const removeElement = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ELEMENT", id });
  }, []);

  const selectElement = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_ELEMENT", id });
  }, []);

  const updateProps = useCallback((id: string, props: Record<string, any>) => {
    dispatch({ type: "UPDATE_PROPS", id, props });
  }, []);

  const updateStyles = useCallback((id: string, styles: Record<string, string>) => {
    dispatch({ type: "UPDATE_STYLES", id, styles });
  }, []);

  const updateContent = useCallback((id: string, content: string) => {
    dispatch({ type: "UPDATE_CONTENT", id, content });
  }, []);

  const moveUp = useCallback((id: string) => {
    dispatch({ type: "MOVE_UP", id });
  }, []);

  const moveDown = useCallback((id: string) => {
    dispatch({ type: "MOVE_DOWN", id });
  }, []);

  const duplicate = useCallback((id: string) => {
    dispatch({ type: "DUPLICATE", id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  const saveToLocalStorage = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, saveBuilderState(state));
  }, [state]);

  const loadFromLocalStorage = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const loaded = loadBuilderState(saved);
      if (loaded) dispatch({ type: "LOAD_STATE", state: loaded });
    }
  }, []);

  return (
    <VisualBuilderContext.Provider value={{
      state, dispatch,
      addElement, removeElement, selectElement,
      updateProps, updateStyles, updateContent,
      moveUp, moveDown, duplicate, clearAll,
      saveToLocalStorage, loadFromLocalStorage,
    }}>
      {children}
    </VisualBuilderContext.Provider>
  );
}

export function useVisualBuilder() {
  const ctx = useContext(VisualBuilderContext);
  if (!ctx) throw new Error("useVisualBuilder must be within VisualBuilderProvider");
  return ctx;
}
