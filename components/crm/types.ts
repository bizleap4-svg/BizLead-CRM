export type StageKind = "open" | "won" | "lost";

export type PipelineStage = {
  id: string;
  name: string;
  order: number;
  kind: StageKind;
  metaEventName?: string;
  googleConversion?: boolean;
};

export type DealPriority = "high" | "medium" | "low";

export type TimelineEvent = {
  id: string;
  type: "note" | "stage_change" | "call" | "email" | "meeting";
  description: string;
  timestamp: string;
  author?: string;
};

export type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  source: string;
  stage: string;
  score: number;
  owner: string;
  value: number;
  probability: number;
  expectedCloseDate?: string;
  priority?: DealPriority;
  nextFollowUp?: string;
  notes?: string;
  lostReason?: string;
  timeline?: TimelineEvent[];
  createdAt: string;
};

export const DEFAULT_PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "new",
    name: "New Lead",
    order: 1,
    kind: "open",
    metaEventName: "Lead",
    googleConversion: false,
  },
  {
    id: "contacted",
    name: "Contacted",
    order: 2,
    kind: "open",
    metaEventName: "Contact",
    googleConversion: false,
  },
  {
    id: "qualified",
    name: "Qualified",
    order: 3,
    kind: "open",
    metaEventName: "QualifyLead",
    googleConversion: false,
  },
  {
    id: "proposal",
    name: "Proposal",
    order: 4,
    kind: "open",
    metaEventName: "InitiateCheckout",
    googleConversion: true,
  },
  {
    id: "negotiation",
    name: "Negotiation",
    order: 5,
    kind: "open",
    metaEventName: "Schedule",
    googleConversion: true,
  },
  {
    id: "won",
    name: "Won",
    order: 6,
    kind: "won",
    metaEventName: "Purchase",
    googleConversion: true,
  },
  {
    id: "lost",
    name: "Lost",
    order: 7,
    kind: "lost",
    metaEventName: "DropOff",
    googleConversion: false,
  },
];

export const PIPELINE_OWNERS = [
  "Sales Executive A",
  "Sales Executive B",
  "Sales Executive C",
];

export const PIPELINE_SOURCES = [
  "Meta Ads",
  "Website",
  "WhatsApp",
  "Instagram",
  "Google Ads",
  "Referral",
  "LinkedIn",
  "Manual",
];
