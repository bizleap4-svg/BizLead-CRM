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
  type: "note" | "stage_change" | "call" | "email" | "meeting" | "file" | "task" | "conversion";
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
  isConverted?: boolean;
  convertedContactId?: string;
  convertedCompanyId?: string;
  convertedDealId?: string;
  createdAt: string;
};

export type ContactLifecycle = "lead" | "prospect" | "customer" | "evangelist" | "churned";

export type Contact = {
  id: string;
  name: string;
  avatar?: string;
  companyId?: string;
  companyName?: string;
  designation?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  owner: string;
  lifecycleStatus: ContactLifecycle;
  source: string;
  relationshipScore: number; // 0 - 100
  tags: string[];
  notes?: string;
  isFavorite?: boolean;
  leadId?: string;
  dealIds?: string[];
  createdAt: string;
  updatedAt: string;
};

export type CompanyLifecycle = "prospect" | "active" | "enterprise" | "inactive";

export type Company = {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  website: string;
  companySize: string; // e.g. "1-10", "11-50", "51-200", "201-500", "500+"
  businessEmail: string;
  businessPhone: string;
  address?: string;
  city: string;
  country: string;
  owner: string;
  lifecycleStatus: CompanyLifecycle;
  accountNotes?: string;
  tags: string[];
  contactIds: string[];
  dealIds: string[];
  annualRevenue?: number;
  createdAt: string;
  updatedAt: string;
};

export type Deal = {
  id: string;
  title: string;
  companyId?: string;
  companyName: string;
  contactId?: string;
  contactName?: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: string;
  priority: DealPriority;
  owner: string;
  source: string;
  nextFollowUp?: string;
  notes?: string;
  lostReason?: string;
  leadId?: string;
  createdAt: string;
  updatedAt: string;
};

export type CRMActivityType =
  | "contact_created"
  | "lead_converted"
  | "deal_created"
  | "stage_change"
  | "note_added"
  | "call"
  | "email"
  | "meeting"
  | "follow_up"
  | "file_attached";

export type CRMActivity = {
  id: string;
  type: CRMActivityType;
  title: string;
  description: string;
  timestamp: string;
  author: string;
  entityType: "contact" | "company" | "lead" | "deal";
  entityId: string;
};

export type CRMNote = {
  id: string;
  entityType: "contact" | "company" | "lead" | "deal";
  entityId: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt?: string;
};

export type CRMFile = {
  id: string;
  entityType: "contact" | "company" | "lead" | "deal";
  entityId: string;
  name: string;
  size: number;
  type: string;
  uploader: string;
  uploadedAt: string;
};

export type CRMTask = {
  id: string;
  entityType: "contact" | "company" | "lead" | "deal";
  entityId: string;
  title: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed";
  assignedTo: string;
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

export const COMPANY_INDUSTRIES = [
  "SaaS & Technology",
  "Design & Creative",
  "Healthcare & Pharma",
  "Logistics & Supply Chain",
  "Retail & E-Commerce",
  "Finance & Banking",
  "Architecture & Interiors",
  "Manufacturing",
  "Education & EdTech",
  "Consulting & Professional Services",
];


// Re-export communication entities for unified CRM state
export * from "../communications/types";
