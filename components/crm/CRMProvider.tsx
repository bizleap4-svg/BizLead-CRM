"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Lead, PipelineStage, DEFAULT_PIPELINE_STAGES } from "./types";
import * as repo from "./repository";

type CRMContextType = {
  leads: Lead[];
  stages: PipelineStage[];
  loading: boolean;
  selectedDeal: Lead | null;
  createLead: (data: Omit<Lead, "id" | "createdAt">) => Promise<Lead>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<Lead>;
  moveLead: (id: string, stageId: string) => Promise<Lead>;
  updateStages: (stages: PipelineStage[]) => Promise<PipelineStage[]>;
  resetCRMData: () => Promise<void>;
  openDealDrawer: (id: string) => void;
  closeDealDrawer: () => void;
  refreshLeads: () => Promise<void>;
};

const CRMContext = createContext<CRMContextType | null>(null);

export function CRMProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>(DEFAULT_PIPELINE_STAGES);
  const [loading, setLoading] = useState(true);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [leadsRes, stagesRes] = await Promise.all([
        repo.listLeads(),
        repo.listStages(),
      ]);
      setLeads(leadsRes);
      setStages(stagesRes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createLead = async (data: Omit<Lead, "id" | "createdAt">) => {
    const created = await repo.createLead(data);
    await loadData();
    return created;
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    const updated = await repo.updateLead(id, updates);
    await loadData();
    return updated;
  };

  const moveLead = async (id: string, stageId: string) => {
    const moved = await repo.moveLead(id, stageId);
    await loadData();
    return moved;
  };

  const updateStages = async (newStages: PipelineStage[]) => {
    const updated = await repo.updateStages(newStages);
    setStages(updated);
    return updated;
  };

  const resetCRMData = async () => {
    await repo.resetCRMData();
    await loadData();
  };

  const openDealDrawer = (id: string) => {
    setSelectedDealId(id);
  };

  const closeDealDrawer = () => {
    setSelectedDealId(null);
  };

  const selectedDeal = leads.find((l) => l.id === selectedDealId) || null;

  return (
    <CRMContext.Provider
      value={{
        leads,
        stages,
        loading,
        selectedDeal,
        createLead,
        updateLead,
        moveLead,
        updateStages,
        resetCRMData,
        openDealDrawer,
        closeDealDrawer,
        refreshLeads: loadData,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
}
