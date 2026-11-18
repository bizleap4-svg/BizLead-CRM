"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface GlobalAIContextType {
  isAIOpen: boolean;
  openAI: () => void;
  closeAI: () => void;
  toggleAI: () => void;
}

const GlobalAIContext = createContext<GlobalAIContextType | null>(null);

export const GlobalAIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bizlead_global_ai_open");
      if (stored === "true") {
        setIsAIOpen(true);
      }
    } catch {}
  }, []);

  const openAI = () => {
    setIsAIOpen(true);
    try {
      localStorage.setItem("bizlead_global_ai_open", "true");
    } catch {}
  };

  const closeAI = () => {
    setIsAIOpen(false);
    try {
      localStorage.setItem("bizlead_global_ai_open", "false");
    } catch {}
  };

  const toggleAI = () => {
    setIsAIOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("bizlead_global_ai_open", String(next));
      } catch {}
      return next;
    });
  };

  return (
    <GlobalAIContext.Provider value={{ isAIOpen, openAI, closeAI, toggleAI }}>
      {children}
    </GlobalAIContext.Provider>
  );
};

export const useGlobalAI = () => {
  const ctx = useContext(GlobalAIContext);
  if (!ctx) {
    return {
      isAIOpen: false,
      openAI: () => {},
      closeAI: () => {},
      toggleAI: () => {},
    };
  }
  return ctx;
};
