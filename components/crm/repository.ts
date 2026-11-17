import { Lead, PipelineStage, DEFAULT_PIPELINE_STAGES } from "./types";

const STORAGE_KEY_LEADS = "bizlead_crm_leads_v1";
const STORAGE_KEY_STAGES = "bizlead_crm_stages_v1";

// Initial reference demo records
export const INITIAL_DEMO_LEADS: Lead[] = [
  {
    id: "BL-001",
    name: "Aarav Sharma",
    company: "Layers Studio",
    email: "aarav@layersstudio.design",
    phone: "+91 98201 44521",
    source: "Meta Ads",
    stage: "qualified",
    score: 96,
    owner: "Sales Executive A",
    value: 84000,
    probability: 60,
    expectedCloseDate: "2026-11-25",
    priority: "high",
    nextFollowUp: "Today, 3:30 PM",
    notes: "Interested in full website overhaul and revenue funnels. Budget approved.",
    createdAt: "2026-11-10",
    timeline: [
      {
        id: "t-1",
        type: "stage_change",
        description: "Stage moved to Qualified",
        timestamp: "Yesterday, 4:30 PM",
      },
      {
        id: "t-2",
        type: "meeting",
        description: "Discovery call conducted with Aarav",
        timestamp: "Nov 14, 2:00 PM",
      },
    ],
  },
  {
    id: "BL-002",
    name: "Ananya Patel",
    company: "Orbit Technologies",
    email: "ananya@orbittech.io",
    phone: "+91 97110 88231",
    source: "Website",
    stage: "proposal",
    score: 88,
    owner: "Sales Executive B",
    value: 120000,
    probability: 75,
    expectedCloseDate: "2026-11-28",
    priority: "high",
    nextFollowUp: "Tomorrow, 11:00 AM",
    notes: "VP requested 5-seat custom proposal with SLA.",
    createdAt: "2026-11-08",
    timeline: [
      {
        id: "t-3",
        type: "stage_change",
        description: "Stage moved to Proposal",
        timestamp: "Today, 10:00 AM",
      },
    ],
  },
  {
    id: "BL-003",
    name: "Rohan Mehta",
    company: "Studio North",
    email: "rohan@studionorth.in",
    phone: "+91 99882 12345",
    source: "WhatsApp",
    stage: "contacted",
    score: 81,
    owner: "Sales Executive C",
    value: 65000,
    probability: 40,
    expectedCloseDate: "2026-12-05",
    priority: "medium",
    nextFollowUp: "Nov 20, 2:00 PM",
    notes: "WhatsApp catalog inquiry regarding inbound automations.",
    createdAt: "2026-11-12",
  },
  {
    id: "BL-004",
    name: "Neha Gupta",
    company: "Forma Collective",
    email: "neha@formacollective.com",
    phone: "+91 91234 56789",
    source: "Instagram",
    stage: "negotiation",
    score: 74,
    owner: "Sales Executive A",
    value: 92000,
    probability: 90,
    expectedCloseDate: "2026-11-22",
    priority: "high",
    nextFollowUp: "Today, 5:00 PM",
    notes: "Final contract review with CFO. Discussing annual payment terms.",
    createdAt: "2026-11-06",
  },
  {
    id: "BL-005",
    name: "Kabir Shah",
    company: "Nova Digital",
    email: "kabir@novadigital.agency",
    phone: "+91 98119 76543",
    source: "Google Ads",
    stage: "new",
    score: 65,
    owner: "",
    value: 45000,
    probability: 20,
    expectedCloseDate: "2026-12-15",
    priority: "medium",
    nextFollowUp: "Nov 19, 10:00 AM",
    notes: "Ebook download from search ad campaign. Needs qualification.",
    createdAt: "2026-11-15",
  },
  {
    id: "BL-006",
    name: "Vikram Rathore",
    company: "Apex Global Logistics",
    email: "vikram@apexlogistics.co",
    phone: "+91 98450 11223",
    source: "Referral",
    stage: "won",
    score: 95,
    owner: "Sales Executive A",
    value: 210000,
    probability: 100,
    expectedCloseDate: "2026-11-15",
    priority: "high",
    nextFollowUp: "Onboarding completed",
    notes: "Annual enterprise agreement signed and payment received.",
    createdAt: "2026-10-28",
  },
  {
    id: "BL-007",
    name: "Dr. Ananya Ray",
    company: "Zenith Health Sciences",
    email: "ananya@zenithhealth.org",
    phone: "+91 99100 45678",
    source: "LinkedIn",
    stage: "lost",
    score: 50,
    owner: "Sales Executive B",
    value: 145000,
    probability: 0,
    expectedCloseDate: "2026-11-10",
    priority: "low",
    nextFollowUp: "-",
    notes: "Project deferred to next fiscal year.",
    lostReason: "Budget deferred to Q2 next year",
    createdAt: "2026-11-01",
  },
];

// In-memory working state
let memoryLeads: Lead[] = [...INITIAL_DEMO_LEADS];
let memoryStages: PipelineStage[] = [...DEFAULT_PIPELINE_STAGES];
let isInitialized = false;

// Safe LocalStorage helpers with schema validation
function loadStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed as T;
    }
    return fallback;
  } catch (err) {
    console.warn(`[BizLead CRM] Error reading ${key} from localStorage`, err);
    return fallback;
  }
}

function persistStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`[BizLead CRM] Error writing ${key} to localStorage`, err);
  }
}

function ensureInitialized() {
  if (isInitialized) return;
  if (typeof window !== "undefined") {
    memoryLeads = loadStorage<Lead[]>(STORAGE_KEY_LEADS, INITIAL_DEMO_LEADS);
    memoryStages = loadStorage<PipelineStage[]>(
      STORAGE_KEY_STAGES,
      DEFAULT_PIPELINE_STAGES
    );
    isInitialized = true;
  }
}

function getStageDefaultProbability(stageId: string): number {
  switch (stageId.toLowerCase()) {
    case "new":
      return 20;
    case "contacted":
      return 40;
    case "qualified":
      return 60;
    case "proposal":
      return 75;
    case "negotiation":
      return 90;
    case "won":
      return 100;
    case "lost":
      return 0;
    default:
      return 50;
  }
}

export async function listLeads(): Promise<Lead[]> {
  ensureInitialized();
  return [...memoryLeads];
}

export async function getLead(id: string): Promise<Lead | undefined> {
  ensureInitialized();
  return memoryLeads.find((l) => l.id === id);
}

export async function createLead(
  leadData: Omit<Lead, "id" | "createdAt">
): Promise<Lead> {
  ensureInitialized();
  const newId = `BL-${String(memoryLeads.length + 1).padStart(3, "0")}`;
  const now = new Date().toISOString().split("T")[0];

  const newLead: Lead = {
    ...leadData,
    id: newId,
    createdAt: now,
    probability:
      leadData.probability ?? getStageDefaultProbability(leadData.stage),
    priority: leadData.priority || "medium",
    timeline: [
      {
        id: `t-${Date.now()}`,
        type: "note",
        description: "Opportunity created in CRM",
        timestamp: "Just now",
      },
      ...(leadData.timeline || []),
    ],
  };

  memoryLeads = [newLead, ...memoryLeads];
  persistStorage(STORAGE_KEY_LEADS, memoryLeads);
  return newLead;
}

export async function updateLead(
  id: string,
  updates: Partial<Lead>
): Promise<Lead> {
  ensureInitialized();
  const index = memoryLeads.findIndex((l) => l.id === id);
  if (index === -1) {
    throw new Error(`Lead with ID ${id} not found.`);
  }

  const existing = memoryLeads[index];
  const updated: Lead = {
    ...existing,
    ...updates,
  };

  memoryLeads[index] = updated;
  persistStorage(STORAGE_KEY_LEADS, memoryLeads);
  return updated;
}

export async function moveLead(id: string, stageId: string): Promise<Lead> {
  ensureInitialized();
  const index = memoryLeads.findIndex((l) => l.id === id);
  if (index === -1) {
    throw new Error(`Lead with ID ${id} not found.`);
  }

  const existing = memoryLeads[index];
  const targetStage = memoryStages.find((s) => s.id === stageId);
  const stageName = targetStage?.name || stageId;

  const newProbability =
    stageId === "won"
      ? 100
      : stageId === "lost"
      ? 0
      : existing.probability || getStageDefaultProbability(stageId);

  const newEvent = {
    id: `t-${Date.now()}`,
    type: "stage_change" as const,
    description: `Stage moved from ${existing.stage} to ${stageName}`,
    timestamp: "Just now",
  };

  const updated: Lead = {
    ...existing,
    stage: stageId,
    probability: newProbability,
    timeline: [newEvent, ...(existing.timeline || [])],
  };

  memoryLeads[index] = updated;
  persistStorage(STORAGE_KEY_LEADS, memoryLeads);
  return updated;
}

export async function listStages(): Promise<PipelineStage[]> {
  ensureInitialized();
  return [...memoryStages];
}

export async function updateStages(
  stages: PipelineStage[]
): Promise<PipelineStage[]> {
  ensureInitialized();
  memoryStages = [...stages];
  persistStorage(STORAGE_KEY_STAGES, memoryStages);
  return memoryStages;
}

export async function resetCRMData(): Promise<void> {
  memoryLeads = [...INITIAL_DEMO_LEADS];
  memoryStages = [...DEFAULT_PIPELINE_STAGES];
  persistStorage(STORAGE_KEY_LEADS, memoryLeads);
  persistStorage(STORAGE_KEY_STAGES, memoryStages);
}
