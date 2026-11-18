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
  | "file_attached"
  | "task_created"
  | "task_completed"
  | "meeting_scheduled"
  | "meeting_completed";

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

// ==========================================
// Phase 06 — Productivity, Tasks & Calendar
// ==========================================

export type TaskType =
  | "follow_up"
  | "call"
  | "email"
  | "whatsapp"
  | "meeting_prep"
  | "proposal"
  | "payment_reminder"
  | "onboarding"
  | "internal"
  | "custom";

export type TaskPriority = "urgent" | "high" | "medium" | "low";

export type TaskStatus =
  | "todo"
  | "in_progress"
  | "waiting"
  | "completed"
  | "cancelled"
  | "pending"; // Backward compatibility alias for 'todo'

export type TaskChecklistItem = {
  id: string;
  title: string;
  completed: boolean;
};

export type TaskComment = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
};

export type RecurrenceRule = {
  frequency: "daily" | "weekly" | "monthly" | "custom";
  interval: number; // e.g. every 1 day, 2 weeks
  endDate?: string;
  daysOfWeek?: number[]; // 0 = Sun, 1 = Mon ...
  maxOccurrences?: number;
};

export type CRMTask = {
  id: string;
  title: string;
  description?: string;
  taskType?: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string;
  createdBy?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  startDate?: string;
  startTime?: string;
  estimatedDuration?: number; // minutes
  completedAt?: string;
  entityType?: "contact" | "company" | "lead" | "deal" | "conversation";
  entityId?: string;
  entityName?: string;
  checklist?: TaskChecklistItem[];
  comments?: TaskComment[];
  recurrenceRule?: RecurrenceRule;
  recurrenceParentId?: string;
  reminderMinutesBefore?: number;
  isArchived?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
};

export type MeetingType =
  | "discovery"
  | "consultation"
  | "demo"
  | "proposal"
  | "negotiation"
  | "onboarding"
  | "internal"
  | "custom";

export type MeetingStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export type MeetingParticipant = {
  name: string;
  email: string;
  role?: string;
  avatar?: string;
};

export type MeetingOutcome = {
  summary: string;
  nextSteps: string[];
  sentiment: "positive" | "neutral" | "cautious";
  updatedDealStage?: string;
};

export type CRMMeeting = {
  id: string;
  title: string;
  meetingType: MeetingType;
  status: MeetingStatus;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  timezone: string; // default "Asia/Kolkata"
  host: string;
  participants: MeetingParticipant[];
  location?: string;
  meetingUrl?: string;
  agenda: string;
  prepNotes?: string;
  outcome?: MeetingOutcome;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  leadId?: string;
  conversationId?: string;
  relatedEntityName?: string;
  createdAt: string;
  updatedAt: string;
};

export type CRMReminder = {
  id: string;
  title: string;
  message: string;
  entityType: "task" | "meeting" | "follow_up";
  entityId: string;
  dueAt: string; // ISO string or YYYY-MM-DDTHH:MM
  isRead: boolean;
  isDismissed: boolean;
  snoozedUntil?: string;
  priority: "urgent" | "high" | "normal";
  createdAt: string;
};

export type SmartRecommendation = {
  id: string;
  ruleId: string;
  reason: string;
  suggestedAction: string;
  suggestedDueDate: string;
  priority: TaskPriority;
  taskType: TaskType;
  entityType: "lead" | "deal" | "meeting" | "conversation" | "contact" | "company";
  entityId: string;
  entityName: string;
  isDismissed?: boolean;
  snoozedUntil?: string;
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
