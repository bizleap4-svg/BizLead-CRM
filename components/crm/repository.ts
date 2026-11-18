import {
  Lead,
  Contact,
  Company,
  Deal,
  CRMActivity,
  CRMNote,
  CRMFile,
  CRMTask,
  TaskType,
  TaskPriority,
  TaskStatus,
  TaskChecklistItem,
  TaskComment,
  RecurrenceRule,
  CRMMeeting,
  MeetingType,
  MeetingStatus,
  MeetingParticipant,
  MeetingOutcome,
  CRMReminder,
  SmartRecommendation,
  PipelineStage,
  DEFAULT_PIPELINE_STAGES,
  Conversation,
  Message,
  Channel,
  ChannelConnection,
  MessageTemplate,
  InternalNote,
  Attachment,
  ConversationStatus,
  ConversationPriority,
  DeliveryStatus,
} from "./types";

const STORAGE_KEY_LEADS = "bizlead_crm_leads_v1";
const STORAGE_KEY_STAGES = "bizlead_crm_stages_v1";
const STORAGE_KEY_CONTACTS = "bizlead_crm_contacts_v1";
const STORAGE_KEY_COMPANIES = "bizlead_crm_companies_v1";
const STORAGE_KEY_DEALS = "bizlead_crm_deals_v1";
const STORAGE_KEY_ACTIVITIES = "bizlead_crm_activities_v1";
const STORAGE_KEY_NOTES = "bizlead_crm_notes_v1";
const STORAGE_KEY_FILES = "bizlead_crm_files_v1";
const STORAGE_KEY_TASKS = "bizlead_crm_tasks_v1";
const STORAGE_KEY_MEETINGS = "bizlead_crm_meetings_v1";
const STORAGE_KEY_REMINDERS = "bizlead_crm_reminders_v1";
const STORAGE_KEY_DISMISSED_RECS = "bizlead_crm_dismissed_recs_v1";
const STORAGE_KEY_CONVERSATIONS = "bizlead_crm_conversations_v1";
const STORAGE_KEY_MESSAGES = "bizlead_crm_messages_v1";
const STORAGE_KEY_TEMPLATES = "bizlead_crm_templates_v1";
const STORAGE_KEY_CHANNELS = "bizlead_crm_channels_v1";

// ==========================================
// 1. Initial Reference Demo Records (Leads)
// ==========================================
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
    isConverted: true,
    convertedContactId: "CON-001",
    convertedCompanyId: "COM-001",
    convertedDealId: "BL-001",
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
    isConverted: true,
    convertedContactId: "CON-002",
    convertedCompanyId: "COM-002",
    convertedDealId: "BL-002",
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

// ==========================================
// 2. Initial Reference Companies
// ==========================================
export const INITIAL_DEMO_COMPANIES: Company[] = [
  {
    id: "COM-001",
    name: "Layers Studio",
    industry: "Design & Creative",
    website: "https://layersstudio.design",
    companySize: "11-50",
    businessEmail: "hello@layersstudio.design",
    businessPhone: "+91 22 2840 9910",
    address: "Level 4, Trade Tower, Lower Parel",
    city: "Mumbai",
    country: "India",
    owner: "Sales Executive A",
    lifecycleStatus: "active",
    accountNotes: "Premium design agency handling tier-1 D2C brands. High revenue expansion potential.",
    tags: ["High Value", "Retainer", "Design"],
    contactIds: ["CON-001", "CON-008"],
    dealIds: ["BL-001", "DL-101"],
    annualRevenue: 4500000,
    createdAt: "2026-11-01",
    updatedAt: "2026-11-16",
  },
  {
    id: "COM-002",
    name: "Orbit Technologies",
    industry: "SaaS & Technology",
    website: "https://orbittech.io",
    companySize: "51-200",
    businessEmail: "contact@orbittech.io",
    businessPhone: "+91 80 4120 5500",
    address: "Indiranagar Tech Park, 100ft Road",
    city: "Bangalore",
    country: "India",
    owner: "Sales Executive B",
    lifecycleStatus: "enterprise",
    accountNotes: "Series B funded cloud infrastructure software company with rapid engineering team growth.",
    tags: ["Enterprise", "Cloud", "SaaS"],
    contactIds: ["CON-002", "CON-009"],
    dealIds: ["BL-002", "DL-102"],
    annualRevenue: 18000000,
    createdAt: "2026-10-15",
    updatedAt: "2026-11-15",
  },
  {
    id: "COM-003",
    name: "Studio North",
    industry: "Architecture & Interiors",
    website: "https://studionorth.in",
    companySize: "11-50",
    businessEmail: "projects@studionorth.in",
    businessPhone: "+91 11 4982 7700",
    address: "Block C, Defence Colony",
    city: "New Delhi",
    country: "India",
    owner: "Sales Executive C",
    lifecycleStatus: "prospect",
    accountNotes: "Luxury architecture firm focusing on commercial real estate and boutique hotels.",
    tags: ["Architecture", "Commercial", "New Delhi"],
    contactIds: ["CON-003"],
    dealIds: ["BL-003"],
    annualRevenue: 3200000,
    createdAt: "2026-11-12",
    updatedAt: "2026-11-12",
  },
  {
    id: "COM-004",
    name: "Forma Collective",
    industry: "Retail & E-Commerce",
    website: "https://formacollective.com",
    companySize: "11-50",
    businessEmail: "support@formacollective.com",
    businessPhone: "+91 141 234 5678",
    address: "MI Road, C-Scheme",
    city: "Jaipur",
    country: "India",
    owner: "Sales Executive A",
    lifecycleStatus: "active",
    accountNotes: "D2C sustainable lifestyle and fashion retail brand scaling omnichannel presence.",
    tags: ["E-Commerce", "D2C", "Fashion"],
    contactIds: ["CON-004"],
    dealIds: ["BL-004"],
    annualRevenue: 8500000,
    createdAt: "2026-10-20",
    updatedAt: "2026-11-14",
  },
  {
    id: "COM-005",
    name: "Nova Digital",
    industry: "Consulting & Professional Services",
    website: "https://novadigital.agency",
    companySize: "1-10",
    businessEmail: "info@novadigital.agency",
    businessPhone: "+91 20 6711 3400",
    address: "Koregaon Park, Lane 5",
    city: "Pune",
    country: "India",
    owner: "Sales Executive B",
    lifecycleStatus: "prospect",
    accountNotes: "Performance marketing and conversion rate optimization consultancy.",
    tags: ["Agency", "Marketing", "Pune"],
    contactIds: ["CON-005"],
    dealIds: ["BL-005"],
    annualRevenue: 2400000,
    createdAt: "2026-11-15",
    updatedAt: "2026-11-15",
  },
  {
    id: "COM-006",
    name: "Apex Global Logistics",
    industry: "Logistics & Supply Chain",
    website: "https://apexlogistics.co",
    companySize: "201-500",
    businessEmail: "cargo@apexlogistics.co",
    businessPhone: "+91 40 2780 1199",
    address: "Financial District, Nanakramguda",
    city: "Hyderabad",
    country: "India",
    owner: "Sales Executive A",
    lifecycleStatus: "enterprise",
    accountNotes: "Nationwide freight forwarding and automated fulfillment network. Key accounts locked.",
    tags: ["Enterprise", "Logistics", "Closed Won"],
    contactIds: ["CON-006"],
    dealIds: ["BL-006"],
    annualRevenue: 42000000,
    createdAt: "2026-09-10",
    updatedAt: "2026-11-15",
  },
  {
    id: "COM-007",
    name: "Zenith Health Sciences",
    industry: "Healthcare & Pharma",
    website: "https://zenithhealth.org",
    companySize: "51-200",
    businessEmail: "corporate@zenithhealth.org",
    businessPhone: "+91 79 2658 9000",
    address: "SG Highway, Bodakdev",
    city: "Ahmedabad",
    country: "India",
    owner: "Sales Executive B",
    lifecycleStatus: "inactive",
    accountNotes: "Clinical trial management firm. Deal deferred due to fiscal year budget restructuring.",
    tags: ["Healthcare", "Pharma", "Lost"],
    contactIds: ["CON-007"],
    dealIds: ["BL-007"],
    annualRevenue: 15000000,
    createdAt: "2026-10-01",
    updatedAt: "2026-11-10",
  },
];

// ==========================================
// 3. Initial Reference Contacts
// ==========================================
export const INITIAL_DEMO_CONTACTS: Contact[] = [
  {
    id: "CON-001",
    name: "Aarav Sharma",
    avatar: "AS",
    companyId: "COM-001",
    companyName: "Layers Studio",
    designation: "Founding Partner & Design Director",
    email: "aarav@layersstudio.design",
    phone: "+91 98201 44521",
    whatsapp: "+919820144521",
    location: "Mumbai, India",
    website: "https://layersstudio.design",
    linkedin: "https://linkedin.com/in/aaravsharma-design",
    owner: "Sales Executive A",
    lifecycleStatus: "customer",
    source: "Meta Ads",
    relationshipScore: 94,
    tags: ["Decision Maker", "Design", "VIP"],
    notes: "Very responsive on WhatsApp. Prefers afternoon updates. Key stakeholder on all brand overhauls.",
    isFavorite: true,
    leadId: "BL-001",
    dealIds: ["BL-001", "DL-101"],
    createdAt: "2026-11-10",
    updatedAt: "2026-11-16",
  },
  {
    id: "CON-002",
    name: "Ananya Patel",
    avatar: "AP",
    companyId: "COM-002",
    companyName: "Orbit Technologies",
    designation: "VP of Engineering & Cloud Infrastructure",
    email: "ananya@orbittech.io",
    phone: "+91 97110 88231",
    whatsapp: "+919711088231",
    location: "Bangalore, India",
    website: "https://orbittech.io",
    linkedin: "https://linkedin.com/in/ananyapatel-tech",
    owner: "Sales Executive B",
    lifecycleStatus: "prospect",
    source: "Website",
    relationshipScore: 88,
    tags: ["Technical Lead", "Security Evaluator"],
    notes: "Requires SOC2 and GDPR compliance documents with proposal. Highly technical evaluation.",
    isFavorite: true,
    leadId: "BL-002",
    dealIds: ["BL-002", "DL-102"],
    createdAt: "2026-11-08",
    updatedAt: "2026-11-15",
  },
  {
    id: "CON-003",
    name: "Rohan Mehta",
    avatar: "RM",
    companyId: "COM-003",
    companyName: "Studio North",
    designation: "Principal Architect",
    email: "rohan@studionorth.in",
    phone: "+91 99882 12345",
    whatsapp: "+919988212345",
    location: "New Delhi, India",
    website: "https://studionorth.in",
    linkedin: "https://linkedin.com/in/rohanmehta-arch",
    owner: "Sales Executive C",
    lifecycleStatus: "prospect",
    source: "WhatsApp",
    relationshipScore: 78,
    tags: ["Architect", "Commercial"],
    notes: "Requested quotation for automated project updates via WhatsApp catalog.",
    isFavorite: false,
    leadId: "BL-003",
    dealIds: ["BL-003"],
    createdAt: "2026-11-12",
    updatedAt: "2026-11-14",
  },
  {
    id: "CON-004",
    name: "Neha Gupta",
    avatar: "NG",
    companyId: "COM-004",
    companyName: "Forma Collective",
    designation: "Brand & Creative Director",
    email: "neha@formacollective.com",
    phone: "+91 91234 56789",
    whatsapp: "+919123456789",
    location: "Jaipur, India",
    website: "https://formacollective.com",
    linkedin: "https://linkedin.com/in/nehagupta-forma",
    owner: "Sales Executive A",
    lifecycleStatus: "customer",
    source: "Instagram",
    relationshipScore: 86,
    tags: ["D2C", "Creative", "Retail"],
    notes: "Contract under review. Finalizing payment milestone terms for annual renewal.",
    isFavorite: true,
    leadId: "BL-004",
    dealIds: ["BL-004"],
    createdAt: "2026-11-06",
    updatedAt: "2026-11-15",
  },
  {
    id: "CON-005",
    name: "Kabir Shah",
    avatar: "KS",
    companyId: "COM-005",
    companyName: "Nova Digital",
    designation: "Managing Director",
    email: "kabir@novadigital.agency",
    phone: "+91 98119 76543",
    whatsapp: "+919811976543",
    location: "Pune, India",
    website: "https://novadigital.agency",
    linkedin: "https://linkedin.com/in/kabirshah-nova",
    owner: "Sales Executive B",
    lifecycleStatus: "lead",
    source: "Google Ads",
    relationshipScore: 65,
    tags: ["Marketing", "Early Stage"],
    notes: "Downloaded whitepaper on Google Ads revenue attribution. Follow up scheduled.",
    isFavorite: false,
    leadId: "BL-005",
    dealIds: ["BL-005"],
    createdAt: "2026-11-15",
    updatedAt: "2026-11-15",
  },
  {
    id: "CON-006",
    name: "Vikram Rathore",
    avatar: "VR",
    companyId: "COM-006",
    companyName: "Apex Global Logistics",
    designation: "Chief Operating Officer",
    email: "vikram@apexlogistics.co",
    phone: "+91 98450 11223",
    whatsapp: "+919845011223",
    location: "Hyderabad, India",
    website: "https://apexlogistics.co",
    linkedin: "https://linkedin.com/in/vikramrathore-ops",
    owner: "Sales Executive A",
    lifecycleStatus: "evangelist",
    source: "Referral",
    relationshipScore: 98,
    tags: ["C-Level", "Enterprise", "Champion"],
    notes: "Enterprise contract closed. Strongly advocated internally for BizLead adoption across 8 hubs.",
    isFavorite: true,
    leadId: "BL-006",
    dealIds: ["BL-006"],
    createdAt: "2026-10-28",
    updatedAt: "2026-11-15",
  },
  {
    id: "CON-007",
    name: "Dr. Ananya Ray",
    avatar: "AR",
    companyId: "COM-007",
    companyName: "Zenith Health Sciences",
    designation: "Head of Clinical Research & IT",
    email: "ananya@zenithhealth.org",
    phone: "+91 99100 45678",
    whatsapp: "+919910045678",
    location: "Ahmedabad, India",
    website: "https://zenithhealth.org",
    linkedin: "https://linkedin.com/in/dr-ananya-ray",
    owner: "Sales Executive B",
    lifecycleStatus: "churned",
    source: "LinkedIn",
    relationshipScore: 50,
    tags: ["Healthcare", "Pharma"],
    notes: "Budget freeze for Q4. Suggested reaching out again in March ahead of FY27 allocations.",
    isFavorite: false,
    leadId: "BL-007",
    dealIds: ["BL-007"],
    createdAt: "2026-11-01",
    updatedAt: "2026-11-10",
  },
  // Multi-contact demonstrate: Layers Studio Contact #2
  {
    id: "CON-008",
    name: "Rajesh Iyer",
    avatar: "RI",
    companyId: "COM-001",
    companyName: "Layers Studio",
    designation: "Head of Procurement & Finance",
    email: "rajesh@layersstudio.design",
    phone: "+91 98200 99881",
    whatsapp: "+919820099881",
    location: "Mumbai, India",
    website: "https://layersstudio.design",
    linkedin: "https://linkedin.com/in/rajesh-iyer-fin",
    owner: "Sales Executive A",
    lifecycleStatus: "customer",
    source: "Internal Referral",
    relationshipScore: 82,
    tags: ["Finance", "Procurement"],
    notes: "Manages vendor contracts and invoicing details for Layers Studio.",
    isFavorite: false,
    dealIds: ["BL-001", "DL-101"],
    createdAt: "2026-11-12",
    updatedAt: "2026-11-15",
  },
  // Multi-contact demonstrate: Orbit Technologies Contact #2
  {
    id: "CON-009",
    name: "Priya Nair",
    avatar: "PN",
    companyId: "COM-002",
    companyName: "Orbit Technologies",
    designation: "Senior Product Operations Manager",
    email: "priya@orbittech.io",
    phone: "+91 97119 33445",
    whatsapp: "+919711933445",
    location: "Bangalore, India",
    website: "https://orbittech.io",
    linkedin: "https://linkedin.com/in/priyanair-prod",
    owner: "Sales Executive B",
    lifecycleStatus: "prospect",
    source: "Website",
    relationshipScore: 84,
    tags: ["Product", "Operations"],
    notes: "Direct report to Ananya. Coordinating workflow demo for internal engineering pods.",
    isFavorite: false,
    dealIds: ["BL-002", "DL-102"],
    createdAt: "2026-11-11",
    updatedAt: "2026-11-15",
  },
];

// ==========================================
// 4. Initial Reference Deals
// ==========================================
export const INITIAL_DEMO_DEALS: Deal[] = [
  {
    id: "BL-001",
    title: "Layers Studio - Web & Funnel Overhaul",
    companyId: "COM-001",
    companyName: "Layers Studio",
    contactId: "CON-001",
    contactName: "Aarav Sharma",
    value: 84000,
    stage: "qualified",
    probability: 60,
    expectedCloseDate: "2026-11-25",
    priority: "high",
    owner: "Sales Executive A",
    source: "Meta Ads",
    nextFollowUp: "Today, 3:30 PM",
    notes: "Website overhaul and automated lead funnels.",
    leadId: "BL-001",
    createdAt: "2026-11-10",
    updatedAt: "2026-11-16",
  },
  // Multi-deal demonstrate: Layers Studio Deal #2
  {
    id: "DL-101",
    title: "Layers Studio - Brand Guidelines Retainer",
    companyId: "COM-001",
    companyName: "Layers Studio",
    contactId: "CON-001",
    contactName: "Aarav Sharma",
    value: 45000,
    stage: "proposal",
    probability: 70,
    expectedCloseDate: "2026-12-10",
    priority: "medium",
    owner: "Sales Executive A",
    source: "Referral",
    nextFollowUp: "Nov 22, 11:30 AM",
    notes: "Quarterly design system updates & brand audit.",
    createdAt: "2026-11-14",
    updatedAt: "2026-11-16",
  },
  {
    id: "BL-002",
    title: "Orbit Technologies - Cloud Platform SLA",
    companyId: "COM-002",
    companyName: "Orbit Technologies",
    contactId: "CON-002",
    contactName: "Ananya Patel",
    value: 120000,
    stage: "proposal",
    probability: 75,
    expectedCloseDate: "2026-11-28",
    priority: "high",
    owner: "Sales Executive B",
    source: "Website",
    nextFollowUp: "Tomorrow, 11:00 AM",
    notes: "5-seat enterprise proposal with dedicated cluster.",
    leadId: "BL-002",
    createdAt: "2026-11-08",
    updatedAt: "2026-11-15",
  },
  // Multi-deal demonstrate: Orbit Technologies Deal #2
  {
    id: "DL-102",
    title: "Orbit Technologies - Custom API Integration Add-on",
    companyId: "COM-002",
    companyName: "Orbit Technologies",
    contactId: "CON-002",
    contactName: "Ananya Patel",
    value: 60000,
    stage: "qualified",
    probability: 50,
    expectedCloseDate: "2026-12-15",
    priority: "medium",
    owner: "Sales Executive B",
    source: "Website",
    nextFollowUp: "Nov 24, 4:00 PM",
    notes: "Webhook telemetry connectors and custom event routing.",
    createdAt: "2026-11-15",
    updatedAt: "2026-11-16",
  },
  {
    id: "BL-003",
    title: "Studio North - WhatsApp Catalog Lead Flow",
    companyId: "COM-003",
    companyName: "Studio North",
    contactId: "CON-003",
    contactName: "Rohan Mehta",
    value: 65000,
    stage: "contacted",
    probability: 40,
    expectedCloseDate: "2026-12-05",
    priority: "medium",
    owner: "Sales Executive C",
    source: "WhatsApp",
    nextFollowUp: "Nov 20, 2:00 PM",
    notes: "Inbound WhatsApp automation pipeline.",
    leadId: "BL-003",
    createdAt: "2026-11-12",
    updatedAt: "2026-11-14",
  },
  {
    id: "BL-004",
    title: "Forma Collective - Omnichannel CRM Integration",
    companyId: "COM-004",
    companyName: "Forma Collective",
    contactId: "CON-004",
    contactName: "Neha Gupta",
    value: 92000,
    stage: "negotiation",
    probability: 90,
    expectedCloseDate: "2026-11-22",
    priority: "high",
    owner: "Sales Executive A",
    source: "Instagram",
    nextFollowUp: "Today, 5:00 PM",
    notes: "Contract under final review with finance head.",
    leadId: "BL-004",
    createdAt: "2026-11-06",
    updatedAt: "2026-11-15",
  },
  {
    id: "BL-005",
    title: "Nova Digital - Growth Marketing Stack",
    companyId: "COM-005",
    companyName: "Nova Digital",
    contactId: "CON-005",
    contactName: "Kabir Shah",
    value: 45000,
    stage: "new",
    probability: 20,
    expectedCloseDate: "2026-12-15",
    priority: "medium",
    owner: "Sales Executive B",
    source: "Google Ads",
    nextFollowUp: "Nov 19, 10:00 AM",
    notes: "Early stage qualification from search ad campaign.",
    leadId: "BL-005",
    createdAt: "2026-11-15",
    updatedAt: "2026-11-15",
  },
  {
    id: "BL-006",
    title: "Apex Global Logistics - Enterprise Hub OS",
    companyId: "COM-006",
    companyName: "Apex Global Logistics",
    contactId: "CON-006",
    contactName: "Vikram Rathore",
    value: 210000,
    stage: "won",
    probability: 100,
    expectedCloseDate: "2026-11-15",
    priority: "high",
    owner: "Sales Executive A",
    source: "Referral",
    nextFollowUp: "Onboarding completed",
    notes: "Annual enterprise contract paid upfront.",
    leadId: "BL-006",
    createdAt: "2026-10-28",
    updatedAt: "2026-11-15",
  },
  {
    id: "BL-007",
    title: "Zenith Health Sciences - Clinical Data Suite",
    companyId: "COM-007",
    companyName: "Zenith Health Sciences",
    contactId: "CON-007",
    contactName: "Dr. Ananya Ray",
    value: 145000,
    stage: "lost",
    probability: 0,
    expectedCloseDate: "2026-11-10",
    priority: "low",
    owner: "Sales Executive B",
    source: "LinkedIn",
    lostReason: "Budget deferred to Q2 next year",
    createdAt: "2026-11-01",
    updatedAt: "2026-11-10",
  },
];

// ==========================================
// 5. Initial Activities & Notes
// ==========================================
export const INITIAL_DEMO_ACTIVITIES: CRMActivity[] = [
  {
    id: "act-001",
    type: "lead_converted",
    title: "Lead Converted",
    description: "Converted lead 'Aarav Sharma' into Contact and Company 'Layers Studio'",
    timestamp: "Nov 10, 2:30 PM",
    author: "Sales Executive A",
    entityType: "contact",
    entityId: "CON-001",
  },
  {
    id: "act-002",
    type: "meeting",
    title: "Architecture Discovery Session",
    description: "Detailed 45-min Zoom call discussing custom funnel metrics and SLA expectations.",
    timestamp: "Nov 14, 2:00 PM",
    author: "Sales Executive A",
    entityType: "contact",
    entityId: "CON-001",
  },
  {
    id: "act-003",
    type: "call",
    title: "Security & Compliance Review",
    description: "Spoke with Ananya Patel regarding cloud infrastructure data residency requirements.",
    timestamp: "Nov 15, 11:30 AM",
    author: "Sales Executive B",
    entityType: "contact",
    entityId: "CON-002",
  },
  {
    id: "act-004",
    type: "deal_created",
    title: "New Opportunity Created",
    description: "Created deal 'Layers Studio - Brand Guidelines Retainer' (₹45,000)",
    timestamp: "Nov 14, 4:00 PM",
    author: "Sales Executive A",
    entityType: "company",
    entityId: "COM-001",
  },
  {
    id: "act-005",
    type: "stage_change",
    title: "Stage Advanced to Won",
    description: "Moved 'Apex Global Logistics - Enterprise Hub OS' to Won. ₹2,10,000 revenue booked.",
    timestamp: "Nov 15, 6:00 PM",
    author: "Sales Executive A",
    entityType: "company",
    entityId: "COM-006",
  },
];

export const INITIAL_DEMO_NOTES: CRMNote[] = [
  {
    id: "note-001",
    entityType: "contact",
    entityId: "CON-001",
    content: "Aarav mentioned their agency is taking on 3 major D2C accounts next month. Excellent upsell timing for automated revenue reporting.",
    author: "Sales Executive A",
    createdAt: "Nov 14, 3:15 PM",
  },
  {
    id: "note-002",
    entityType: "company",
    entityId: "COM-001",
    content: "Billing contact is Rajesh Iyer (Procurement Head). Invoices must be sent before the 25th of each month for net-15 payment terms.",
    author: "Sales Executive A",
    createdAt: "Nov 12, 11:00 AM",
  },
  {
    id: "note-003",
    entityType: "contact",
    entityId: "CON-002",
    content: "Ananya requested an architecture whitepaper regarding our real-time synchronization speed and webhook fault tolerance.",
    author: "Sales Executive B",
    createdAt: "Nov 15, 12:00 PM",
  },
];

export const INITIAL_DEMO_FILES: CRMFile[] = [
  {
    id: "file-001",
    entityType: "company",
    entityId: "COM-001",
    name: "Layers_Studio_Proposal_v2.pdf",
    size: 2450000,
    type: "application/pdf",
    uploader: "Sales Executive A",
    uploadedAt: "Nov 14, 2026",
  },
  {
    id: "file-002",
    entityType: "contact",
    entityId: "CON-002",
    name: "Orbit_Tech_Compliance_Checklist.docx",
    size: 1120000,
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    uploader: "Sales Executive B",
    uploadedAt: "Nov 15, 2026",
  },
];

export const INITIAL_DEMO_TASKS: CRMTask[] = [
  {
    id: "task-001",
    title: "Follow up with Layers Studio regarding annual contract",
    description: "Discuss enterprise volume tier and 12% discount approved by finance.",
    taskType: "call",
    priority: "high",
    status: "todo",
    assignedTo: "Sales Executive A",
    dueDate: "2026-11-18",
    dueTime: "10:00",
    estimatedDuration: 30,
    entityType: "contact",
    entityId: "CON-001",
    entityName: "Aarav Sharma · Layers Studio",
    checklist: [
      { id: "chk-1", title: "Review discount terms", completed: true },
      { id: "chk-2", title: "Confirm SLA requirements", completed: false },
      { id: "chk-3", title: "Send signature link via DocuSign", completed: false },
    ],
    tags: ["High Value", "Contract"],
    createdAt: "2026-11-15T09:00:00Z",
  },
  {
    id: "task-002",
    title: "Send customized proposal to Orbit Technologies",
    description: "Prepare tailored enterprise proposal with multi-region deployment details.",
    taskType: "proposal",
    priority: "high",
    status: "todo",
    assignedTo: "Sales Executive B",
    dueDate: "2026-11-18",
    dueTime: "11:30",
    estimatedDuration: 45,
    entityType: "company",
    entityId: "COM-002",
    entityName: "Orbit Technologies",
    checklist: [
      { id: "chk-4", title: "Verify infrastructure specs", completed: true },
      { id: "chk-5", title: "Attach pricing sheet", completed: false },
    ],
    tags: ["Proposal", "Enterprise"],
    createdAt: "2026-11-16T11:00:00Z",
  },
  {
    id: "task-003",
    title: "Prepare discovery meeting deck for Apex Logistics",
    description: "Review warehouse automation workflows and integration touchpoints.",
    taskType: "meeting_prep",
    priority: "medium",
    status: "todo",
    assignedTo: "Sales Executive A",
    dueDate: "2026-11-18",
    dueTime: "12:30",
    estimatedDuration: 30,
    entityType: "lead",
    entityId: "BL-002",
    entityName: "Rohan Varma · Apex Logistics",
    checklist: [
      { id: "chk-6", title: "Review competitor pricing comparison", completed: false },
      { id: "chk-7", title: "Export slide deck to PDF", completed: false },
    ],
    tags: ["Deck", "Discovery"],
    createdAt: "2026-11-17T14:00:00Z",
  },
  {
    id: "task-004",
    title: "Review Instagram inbound inquiries from designers",
    description: "Qualify inbound design studio leads received through social messaging.",
    taskType: "whatsapp",
    priority: "medium",
    status: "todo",
    assignedTo: "Sales Executive A",
    dueDate: "2026-11-18",
    dueTime: "14:00",
    estimatedDuration: 20,
    entityType: "conversation",
    entityId: "CNV-006",
    entityName: "Neha Kapoor (@neha_designs)",
    tags: ["Social", "Inbound"],
    createdAt: "2026-11-18T08:00:00Z",
  },
  {
    id: "task-005",
    title: "Update weekly sales forecast & pipeline milestones",
    description: "Align with revenue leadership on Q4 quota achievements and deal stages.",
    taskType: "internal",
    priority: "low",
    status: "todo",
    assignedTo: "Sales Executive C",
    dueDate: "2026-11-18",
    dueTime: "16:00",
    estimatedDuration: 30,
    tags: ["Forecast", "Internal"],
    createdAt: "2026-11-17T16:00:00Z",
  },
  {
    id: "task-006",
    title: "Payment reminder: CloudScale Enterprise invoice overdue",
    description: "Overdue invoice for ₹1,80,000. Send reminder notice to finance department.",
    taskType: "payment_reminder",
    priority: "urgent",
    status: "todo",
    assignedTo: "Sales Executive A",
    dueDate: "2026-11-16", // OVERDUE!
    dueTime: "17:00",
    estimatedDuration: 15,
    entityType: "lead",
    entityId: "BL-003",
    entityName: "Kavita Rao · CloudScale",
    tags: ["Invoice", "Overdue", "Finance"],
    createdAt: "2026-11-10T10:00:00Z",
  },
  {
    id: "task-007",
    title: "Verify account manager handover for Apex Logistics",
    description: "Confirmed operational transition from SDR to Senior Account Executive.",
    taskType: "onboarding",
    priority: "high",
    status: "completed",
    assignedTo: "Sales Executive A",
    dueDate: "2026-11-18",
    dueTime: "09:30",
    completedAt: "2026-11-18T09:30:00Z",
    entityType: "company",
    entityId: "COM-006",
    entityName: "Apex Logistics",
    tags: ["Onboarding", "Done"],
    createdAt: "2026-11-14T09:00:00Z",
  },
  {
    id: "task-008",
    title: "Technical architecture walkthrough with Vikram",
    description: "Discuss API throughput limits, OAuth2 token rotation, and webhook retries.",
    taskType: "call",
    priority: "medium",
    status: "todo",
    assignedTo: "Sales Executive B",
    dueDate: "2026-11-21",
    dueTime: "15:00",
    entityType: "contact",
    entityId: "CON-002",
    entityName: "Vikram Malhotra · Orbit Technologies",
    tags: ["Technical", "Architecture"],
    createdAt: "2026-11-15T12:00:00Z",
  },
];

export const INITIAL_DEMO_MEETINGS: CRMMeeting[] = [
  {
    id: "meet-001",
    title: "Strategy & Technical Demo Session",
    meetingType: "demo",
    status: "scheduled",
    date: "2026-11-18",
    startTime: "11:00",
    endTime: "11:45",
    timezone: "Asia/Kolkata",
    host: "Sales Executive A",
    participants: [
      { name: "Aarav Sharma", email: "aarav@layersstudio.com", role: "Design Director", avatar: "AS" },
      { name: "Sales Executive A", email: "praveen@bizlead.io", role: "Account Executive", avatar: "SE" },
    ],
    meetingUrl: "https://meet.google.com/xyz-layers-demo",
    location: "Google Meet",
    agenda: "1. Review high-traffic CRM demands\n2. Demonstrate WhatsApp omnichannel workflows\n3. Walk through custom pipeline conversion rules",
    prepNotes: "Aarav is keen on automated stage movement and WhatsApp integration. Emphasize multi-user team inbox.",
    contactId: "CON-001",
    companyId: "COM-001",
    dealId: "BL-001",
    relatedEntityName: "Aarav Sharma · Layers Studio",
    createdAt: "2026-11-16T10:00:00Z",
    updatedAt: "2026-11-16T10:00:00Z",
  },
  {
    id: "meet-002",
    title: "Commercial & SLA Negotiation",
    meetingType: "negotiation",
    status: "scheduled",
    date: "2026-11-19",
    startTime: "14:30",
    endTime: "15:15",
    timezone: "Asia/Kolkata",
    host: "Sales Executive B",
    participants: [
      { name: "Vikram Malhotra", email: "vikram@orbittech.in", role: "VP Engineering", avatar: "VM" },
      { name: "Sales Executive B", email: "execb@bizlead.io", role: "Senior AE", avatar: "SB" },
    ],
    meetingUrl: "https://zoom.us/j/9876543210",
    location: "Zoom Video Conference",
    agenda: "Finalize master service agreement, 99.9% uptime SLA, and payment milestones.",
    prepNotes: "Finance approved up to 12% discount on 2-year prepayment. Target deal value: ₹3,20,000.",
    contactId: "CON-002",
    companyId: "COM-002",
    dealId: "BL-002",
    relatedEntityName: "Vikram Malhotra · Orbit Technologies",
    createdAt: "2026-11-17T11:00:00Z",
    updatedAt: "2026-11-17T11:00:00Z",
  },
  {
    id: "meet-003",
    title: "Weekly Revenue Leadership Alignment",
    meetingType: "internal",
    status: "scheduled",
    date: "2026-11-20",
    startTime: "16:00",
    endTime: "17:00",
    timezone: "Asia/Kolkata",
    host: "Sales Executive A",
    participants: [
      { name: "Sales Executive A", email: "praveen@bizlead.io", role: "AE", avatar: "SE" },
      { name: "Sales Executive B", email: "execb@bizlead.io", role: "AE", avatar: "SB" },
      { name: "Sales Executive C", email: "execc@bizlead.io", role: "SDR Lead", avatar: "SC" },
    ],
    location: "Main Boardroom / BizLead HQ",
    agenda: "1. Pipeline velocity review\n2. Conversion bottleneck analysis\n3. Next month target allocation",
    createdAt: "2026-11-15T09:00:00Z",
    updatedAt: "2026-11-15T09:00:00Z",
  },
  {
    id: "meet-004",
    title: "Product Discovery Call with Neha",
    meetingType: "discovery",
    status: "completed",
    date: "2026-11-17",
    startTime: "15:00",
    endTime: "15:30",
    timezone: "Asia/Kolkata",
    host: "Sales Executive A",
    participants: [
      { name: "Neha Kapoor", email: "neha@kapoordesigns.in", role: "Owner", avatar: "NK" },
    ],
    agenda: "Discuss switching from HubSpot to BizLead Revenue OS.",
    outcome: {
      summary: "Neha is frustrated with HubSpot's per-contact pricing and complex interface. Wants simple WhatsApp + Pipeline tracking.",
      nextSteps: ["Send comparison deck", "Schedule full team onboarding"],
      sentiment: "positive",
      updatedDealStage: "qualified",
    },
    contactId: "CON-005",
    relatedEntityName: "Neha Kapoor · Kapoor Luxury Interiors",
    createdAt: "2026-11-16T14:00:00Z",
    updatedAt: "2026-11-17T16:00:00Z",
  },
];

export const INITIAL_DEMO_REMINDERS: CRMReminder[] = [
  {
    id: "rem-001",
    title: "Meeting starting in 30 minutes",
    message: "Strategy Demo Session with Layers Studio (Aarav Sharma) at 11:00 AM.",
    entityType: "meeting",
    entityId: "meet-001",
    dueAt: "2026-11-18T10:30:00Z",
    isRead: false,
    isDismissed: false,
    priority: "high",
    createdAt: "2026-11-18T10:00:00Z",
  },
  {
    id: "rem-002",
    title: "Overdue Task Action Required",
    message: "Payment reminder for CloudScale Enterprise invoice was due Nov 16.",
    entityType: "task",
    entityId: "task-006",
    dueAt: "2026-11-16T17:00:00Z",
    isRead: false,
    isDismissed: false,
    priority: "urgent",
    createdAt: "2026-11-16T17:00:00Z",
  },
  {
    id: "rem-003",
    title: "Smart Follow-up: New Inbound Lead",
    message: "Neha Kapoor reached out on Instagram and has not had a follow-up scheduled.",
    entityType: "follow_up",
    entityId: "BL-004",
    dueAt: "2026-11-18T09:00:00Z",
    isRead: false,
    isDismissed: false,
    priority: "high",
    createdAt: "2026-11-18T08:00:00Z",
  },
];

// ==========================================
// 6. Initial Reference Demo Records (Communications)
// ==========================================
export const INITIAL_DEMO_MESSAGES: Message[] = [
  // CNV-001 (Aarav Sharma - WhatsApp)
  {
    id: "MSG-001",
    conversationId: "CNV-001",
    channel: "whatsapp",
    senderType: "customer",
    senderName: "Aarav Sharma",
    content: "Hi team, we reviewed the revised scope for the design overhaul. Are we still on track for milestone 1 delivery by next month?",
    timestamp: "2026-11-17T15:30:00Z",
    deliveryStatus: "read",
    isSimulatedDemo: true,
  },
  {
    id: "MSG-002",
    conversationId: "CNV-001",
    channel: "whatsapp",
    senderType: "executive",
    senderName: "Sales Executive A",
    content: "Hello Aarav! Yes, our engineering team has finalized sprint 1 milestones. I will share the staging preview tomorrow by 3:00 PM.",
    timestamp: "2026-11-17T15:45:00Z",
    deliveryStatus: "read",
    isSimulatedDemo: true,
  },
  {
    id: "MSG-003",
    conversationId: "CNV-001",
    channel: "whatsapp",
    senderType: "executive",
    senderName: "Sales Executive A",
    content: "Internal Note: Aarav approved the ₹84,000 initial tranche in our review call. Keep commercial invoice ready for signing once staging is greenlit.",
    timestamp: "2026-11-17T16:00:00Z",
    isInternalNote: true,
    isSimulatedDemo: true,
  },
  {
    id: "MSG-004",
    conversationId: "CNV-001",
    channel: "whatsapp",
    senderType: "customer",
    senderName: "Aarav Sharma",
    content: "Sounds great! Also, please confirm if the analytics dashboard integration is included in this milestone.",
    timestamp: "2026-11-18T05:45:00Z",
    deliveryStatus: "delivered",
    isSimulatedDemo: true,
  },

  // CNV-002 (Ananya Patel - Instagram)
  {
    id: "MSG-005",
    conversationId: "CNV-002",
    channel: "instagram",
    senderType: "customer",
    senderName: "Ananya Patel",
    content: "Saw your latest demo regarding omnichannel revenue tracking. Does BizLead connect with our existing Meta Ad accounts?",
    timestamp: "2026-11-18T04:30:00Z",
    deliveryStatus: "read",
    isSimulatedDemo: true,
  },
  {
    id: "MSG-006",
    conversationId: "CNV-002",
    channel: "instagram",
    senderType: "customer",
    senderName: "Ananya Patel",
    content: "We want to track ROAS down to individual closed deals for our enterprise clients in Orbit Tech.",
    timestamp: "2026-11-18T04:32:00Z",
    deliveryStatus: "delivered",
    isSimulatedDemo: true,
  },

  // CNV-003 (Vikram Mehta - Email)
  {
    id: "MSG-007",
    conversationId: "CNV-003",
    channel: "email",
    senderType: "customer",
    senderName: "Vikram Mehta",
    content: "Dear BizLead Team,\n\nCould you please provide the updated security compliance documentation for ISO 27001 before our procurement committee meets this Thursday?\n\nBest regards,\nVikram Mehta\nCOO, Kavach Logistics",
    timestamp: "2026-11-16T09:00:00Z",
    deliveryStatus: "read",
    isSimulatedDemo: true,
  },
  {
    id: "MSG-008",
    conversationId: "CNV-003",
    channel: "email",
    senderType: "executive",
    senderName: "Sales Executive A",
    content: "Hi Vikram,\n\nAttached is our compliance sheet and SOC2 Type II audit summary. Let us know if your IT council needs a brief 10-minute briefing call with our security lead.\n\nWarm regards,\nSales Executive A",
    timestamp: "2026-11-16T10:40:00Z",
    deliveryStatus: "read",
    isSimulatedDemo: true,
    attachments: [
      {
        id: "att-001",
        name: "BizLead_Security_SOC2_Summary.pdf",
        size: 1420000,
        type: "application/pdf",
        isDemoPrototype: true,
      },
    ],
  },
  {
    id: "MSG-009",
    conversationId: "CNV-003",
    channel: "email",
    senderType: "executive",
    senderName: "Sales Executive A",
    content: "Internal Note: IT team at Kavach reviewed compliance. Awaiting final green light from procurement head.",
    timestamp: "2026-11-16T11:00:00Z",
    isInternalNote: true,
    isSimulatedDemo: true,
  },

  // CNV-004 (Rohan Verma - Messenger)
  {
    id: "MSG-010",
    conversationId: "CNV-004",
    channel: "messenger",
    senderType: "customer",
    senderName: "Rohan Verma",
    content: "Thank you for the quick setup guide. Our clinic staff is already using the WhatsApp patient reminders smoothly!",
    timestamp: "2026-11-15T05:50:00Z",
    deliveryStatus: "read",
    isSimulatedDemo: true,
  },
  {
    id: "MSG-011",
    conversationId: "CNV-004",
    channel: "messenger",
    senderType: "executive",
    senderName: "Sales Executive B",
    content: "Delighted to hear that, Dr. Rohan! We are always here if you need custom consultation follow-up automations.",
    timestamp: "2026-11-15T06:05:00Z",
    deliveryStatus: "read",
    isSimulatedDemo: true,
  },

  // CNV-005 (Sneha Kulkarni - Website Chat)
  {
    id: "MSG-012",
    conversationId: "CNV-005",
    channel: "website",
    senderType: "customer",
    senderName: "Sneha Kulkarni",
    content: "Hello from your pricing page. We run an interior studio with 12 consultants. Does the growth plan support multi-agent live chat assignment?",
    timestamp: "2026-11-18T07:10:00Z",
    deliveryStatus: "delivered",
    isSimulatedDemo: true,
  },

  // CNV-006 (Neha Kapoor - Instagram Unlinked Lead)
  {
    id: "MSG-013",
    conversationId: "CNV-006",
    channel: "instagram",
    senderType: "customer",
    senderName: "Neha Kapoor",
    content: "Hey BizLead! We are looking to migrate from HubSpot. We have 45 designers and need WhatsApp + Instagram routing in one place. What are your pricing tiers for custom seats?",
    timestamp: "2026-11-18T07:40:00Z",
    deliveryStatus: "delivered",
    isSimulatedDemo: true,
  },
];

export const INITIAL_DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: "CNV-001",
    channel: "whatsapp",
    status: "open",
    priority: "high",
    participant: {
      id: "PAR-001",
      name: "Aarav Sharma",
      handleOrIdentifier: "+91 98201 44521",
      avatar: "AS",
      channel: "whatsapp",
    },
    contactId: "CON-001",
    leadId: "BL-001",
    companyId: "COM-001",
    dealId: "BL-001",
    assignedOwner: "Sales Executive A",
    unreadCount: 1,
    lastMessage: INITIAL_DEMO_MESSAGES[3],
    tags: ["Key Account", "Design", "WhatsApp"],
    channelAccountId: "+91 98201 00000",
    createdAt: "2026-11-17T15:30:00Z",
    updatedAt: "2026-11-18T05:45:00Z",
  },
  {
    id: "CNV-002",
    channel: "instagram",
    status: "open",
    priority: "urgent",
    participant: {
      id: "PAR-002",
      name: "Ananya Patel",
      handleOrIdentifier: "@ananya.orbittech",
      avatar: "AP",
      channel: "instagram",
    },
    contactId: "CON-003",
    companyId: "COM-002",
    dealId: "BL-002",
    assignedOwner: "Sales Executive B",
    unreadCount: 2,
    lastMessage: INITIAL_DEMO_MESSAGES[5],
    tags: ["SaaS", "ROAS Inquiry", "Instagram"],
    channelAccountId: "@bizlead.official",
    createdAt: "2026-11-18T04:30:00Z",
    updatedAt: "2026-11-18T04:32:00Z",
  },
  {
    id: "CNV-003",
    channel: "email",
    status: "pending",
    priority: "medium",
    participant: {
      id: "PAR-003",
      name: "Vikram Mehta",
      handleOrIdentifier: "vikram@kavachlogistics.com",
      avatar: "VM",
      channel: "email",
    },
    contactId: "CON-006",
    companyId: "COM-004",
    dealId: "BL-004",
    assignedOwner: "Sales Executive A",
    unreadCount: 0,
    lastMessage: INITIAL_DEMO_MESSAGES[8],
    tags: ["Logistics", "Security Audit", "Email"],
    channelAccountId: "growth@bizlead.io",
    createdAt: "2026-11-16T09:00:00Z",
    updatedAt: "2026-11-16T11:00:00Z",
  },
  {
    id: "CNV-004",
    channel: "messenger",
    status: "resolved",
    priority: "low",
    participant: {
      id: "PAR-004",
      name: "Rohan Verma",
      handleOrIdentifier: "rohan@zenithhealth.in",
      avatar: "RV",
      channel: "messenger",
    },
    contactId: "CON-005",
    companyId: "COM-003",
    dealId: "BL-003",
    assignedOwner: "Sales Executive B",
    unreadCount: 0,
    lastMessage: INITIAL_DEMO_MESSAGES[10],
    tags: ["Healthcare", "Onboarded", "Messenger"],
    channelAccountId: "facebook.com/BizLeadRevenueOS",
    createdAt: "2026-11-15T05:50:00Z",
    updatedAt: "2026-11-15T06:05:00Z",
  },
  {
    id: "CNV-005",
    channel: "website",
    status: "open",
    priority: "high",
    participant: {
      id: "PAR-005",
      name: "Sneha Kulkarni",
      handleOrIdentifier: "sneha@artisanliving.co",
      avatar: "SK",
      channel: "website",
    },
    contactId: "CON-007",
    companyId: "COM-005",
    dealId: "BL-005",
    assignedOwner: "Sales Executive A",
    unreadCount: 1,
    lastMessage: INITIAL_DEMO_MESSAGES[11],
    tags: ["Pricing Page", "Live Chat", "Website"],
    channelAccountId: "bizlead.io",
    createdAt: "2026-11-18T07:10:00Z",
    updatedAt: "2026-11-18T07:10:00Z",
  },
  {
    id: "CNV-006",
    channel: "instagram",
    status: "open",
    priority: "high",
    participant: {
      id: "PAR-006",
      name: "Neha Kapoor",
      handleOrIdentifier: "@neha_designs",
      avatar: "NK",
      channel: "instagram",
    },
    // Unlinked inbound lead - no contactId, leadId or companyId!
    assignedOwner: "Sales Executive A",
    unreadCount: 1,
    lastMessage: INITIAL_DEMO_MESSAGES[12],
    tags: ["Inbound Lead", "HubSpot Switcher", "Instagram"],
    channelAccountId: "@bizlead.official",
    createdAt: "2026-11-18T07:40:00Z",
    updatedAt: "2026-11-18T07:40:00Z",
  },
];

export const INITIAL_DEMO_TEMPLATES: MessageTemplate[] = [
  {
    id: "TMP-001",
    title: "Instant First Response",
    category: "First response",
    content: "Hi {contact_name}, thanks for reaching out to BizLead! Our team is reviewing your requirements for {company_name}. How soon are you planning to get started?",
    isFavorite: true,
    channel: "all",
  },
  {
    id: "TMP-002",
    title: "Team Size & Lead Volume Qualifier",
    category: "Lead qualification",
    content: "Hello {contact_name}, to help us tailor the most effective growth architecture for {company_name}, could you share your approximate team size and current monthly lead volume?",
    isFavorite: true,
    channel: "all",
  },
  {
    id: "TMP-003",
    title: "Custom Pricing Estimate",
    category: "Pricing inquiry",
    content: "Hi {contact_name}, based on your workflow at {company_name}, our Revenue OS tier starts at {deal_value} including unified WhatsApp routing. Would you like a 15-minute product walkthrough to explore exact requirements?",
    isFavorite: true,
    channel: "all",
  },
  {
    id: "TMP-004",
    title: "Product Walkthrough Invite",
    category: "Appointment scheduling",
    content: "Hi {contact_name}, I would love to show you how BizLead can accelerate {company_name}'s conversions. Are you available for a brief sync tomorrow at 3:00 PM?",
    isFavorite: false,
    channel: "all",
  },
  {
    id: "TMP-005",
    title: "Commercial Proposal Follow-Up",
    category: "Proposal follow-up",
    content: "Hi {contact_name}, following up on the commercial proposal we shared for {company_name} ({deal_value}). Did you and the executive team have any questions on the milestones?",
    isFavorite: true,
    channel: "all",
  },
  {
    id: "TMP-006",
    title: "Technical Review & Support",
    category: "Customer support",
    content: "Hello {contact_name}, thank you for flagging this. Our technical team has been assigned and is verifying the sync status for {company_name}. We will update you shortly.",
    isFavorite: false,
    channel: "all",
  },
  {
    id: "TMP-007",
    title: "Confirmation & Handover",
    category: "General replies",
    content: "Thanks for confirming, {contact_name}! We have updated your account records. Please let {executive_name} know if you need anything else.",
    isFavorite: false,
    channel: "all",
  },
];

export const INITIAL_DEMO_CHANNELS: ChannelConnection[] = [
  {
    id: "conn-wa-01",
    channel: "whatsapp",
    name: "WhatsApp Business Cloud API",
    accountIdentifier: "+91 98201 00000",
    status: "demo_mode",
    capabilities: [
      "Inbound Messages",
      "Outbound Replies",
      "Document & Image Attachments",
      "Delivery & Read Receipts",
      "Meta Approved Templates",
    ],
    lastSyncAt: "Just now",
    isDemo: true,
    setupGuide: "Requires Meta Business Verification, WABA ID, Phone Number ID, and a server webhook.",
    docsUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api",
  },
  {
    id: "conn-ig-01",
    channel: "instagram",
    name: "Instagram Professional Direct",
    accountIdentifier: "@bizlead.official",
    status: "demo_mode",
    capabilities: [
      "Direct Messages (DMs)",
      "Story Mentions & Replies",
      "Media & Image Sharing",
      "Read Receipts",
    ],
    lastSyncAt: "Just now",
    isDemo: true,
    setupGuide: "Requires an Instagram Professional Account linked to a Facebook Page with messaging permissions.",
    docsUrl: "https://developers.facebook.com/docs/messenger-platform/instagram",
  },
  {
    id: "conn-ms-01",
    channel: "messenger",
    name: "Facebook Page Messenger",
    accountIdentifier: "facebook.com/BizLeadRevenueOS",
    status: "demo_mode",
    capabilities: [
      "Page Direct Messages",
      "Lead Ad Inquiries",
      "File Attachments",
      "Automated Greeting Flow",
    ],
    lastSyncAt: "Just now",
    isDemo: true,
    setupGuide: "Requires Facebook Page Admin access and Meta pages_messaging permission.",
    docsUrl: "https://developers.facebook.com/docs/messenger-platform",
  },
  {
    id: "conn-em-01",
    channel: "email",
    name: "Corporate Email (SMTP/IMAP)",
    accountIdentifier: "growth@bizlead.io",
    status: "demo_mode",
    capabilities: [
      "Inbound Email Threading",
      "Outbound HTML & Plaintext",
      "PDF/DOCX Attachment Parsing",
      "SPF / DKIM Authenticated Sending",
    ],
    lastSyncAt: "Just now",
    isDemo: true,
    setupGuide: "Connect corporate email domain via MX routing or SendGrid/Postmark inbound webhook.",
    docsUrl: "https://sendgrid.com/docs/for-developers/parsing-email/inbound-email/",
  },
  {
    id: "conn-wb-01",
    channel: "website",
    name: "BizLead Web Widget v2.1",
    accountIdentifier: "bizlead.io",
    status: "demo_mode",
    capabilities: [
      "Real-time WebSocket Chat",
      "Lead Capture Pre-chat Form",
      "Session URL & Page Tracking",
      "Agent Hand-off",
    ],
    lastSyncAt: "Just now",
    isDemo: true,
    setupGuide: "Embed the BizLead chat script tag into your web application HTML footer.",
    docsUrl: "https://bizlead.io/docs/chat-widget",
  },
];

// ==========================================
// 7. In-Memory Working State & Persistence
// ==========================================
let memoryLeads: Lead[] = [...INITIAL_DEMO_LEADS];
let memoryStages: PipelineStage[] = [...DEFAULT_PIPELINE_STAGES];
let memoryContacts: Contact[] = [...INITIAL_DEMO_CONTACTS];
let memoryCompanies: Company[] = [...INITIAL_DEMO_COMPANIES];
let memoryDeals: Deal[] = [...INITIAL_DEMO_DEALS];
let memoryActivities: CRMActivity[] = [...INITIAL_DEMO_ACTIVITIES];
let memoryNotes: CRMNote[] = [...INITIAL_DEMO_NOTES];
let memoryFiles: CRMFile[] = [...INITIAL_DEMO_FILES];
let memoryTasks: CRMTask[] = [...INITIAL_DEMO_TASKS];
let memoryMeetings: CRMMeeting[] = [...INITIAL_DEMO_MEETINGS];
let memoryReminders: CRMReminder[] = [...INITIAL_DEMO_REMINDERS];
let memoryDismissedRecs: string[] = [];
let memoryConversations: Conversation[] = [...INITIAL_DEMO_CONVERSATIONS];
let memoryMessages: Message[] = [...INITIAL_DEMO_MESSAGES];
let memoryTemplates: MessageTemplate[] = [...INITIAL_DEMO_TEMPLATES];
let memoryChannels: ChannelConnection[] = [...INITIAL_DEMO_CHANNELS];
let isInitialized = false;

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
    memoryContacts = loadStorage<Contact[]>(
      STORAGE_KEY_CONTACTS,
      INITIAL_DEMO_CONTACTS
    );
    memoryCompanies = loadStorage<Company[]>(
      STORAGE_KEY_COMPANIES,
      INITIAL_DEMO_COMPANIES
    );
    memoryDeals = loadStorage<Deal[]>(STORAGE_KEY_DEALS, INITIAL_DEMO_DEALS);
    memoryActivities = loadStorage<CRMActivity[]>(
      STORAGE_KEY_ACTIVITIES,
      INITIAL_DEMO_ACTIVITIES
    );
    memoryNotes = loadStorage<CRMNote[]>(STORAGE_KEY_NOTES, INITIAL_DEMO_NOTES);
    memoryFiles = loadStorage<CRMFile[]>(STORAGE_KEY_FILES, INITIAL_DEMO_FILES);
    memoryTasks = loadStorage<CRMTask[]>(STORAGE_KEY_TASKS, INITIAL_DEMO_TASKS);
    memoryMeetings = loadStorage<CRMMeeting[]>(
      STORAGE_KEY_MEETINGS,
      INITIAL_DEMO_MEETINGS
    );
    memoryReminders = loadStorage<CRMReminder[]>(
      STORAGE_KEY_REMINDERS,
      INITIAL_DEMO_REMINDERS
    );
    memoryDismissedRecs = loadStorage<string[]>(
      STORAGE_KEY_DISMISSED_RECS,
      []
    );
    memoryConversations = loadStorage<Conversation[]>(
      STORAGE_KEY_CONVERSATIONS,
      INITIAL_DEMO_CONVERSATIONS
    );
    memoryMessages = loadStorage<Message[]>(
      STORAGE_KEY_MESSAGES,
      INITIAL_DEMO_MESSAGES
    );
    memoryTemplates = loadStorage<MessageTemplate[]>(
      STORAGE_KEY_TEMPLATES,
      INITIAL_DEMO_TEMPLATES
    );
    memoryChannels = loadStorage<ChannelConnection[]>(
      STORAGE_KEY_CHANNELS,
      INITIAL_DEMO_CHANNELS
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

// ==========================================
// 7. Repository Methods — Leads
// ==========================================
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

  // Synchronize corresponding deal in deals store if exists
  const dealIdx = memoryDeals.findIndex((d) => d.id === id || d.leadId === id);
  if (dealIdx !== -1) {
    memoryDeals[dealIdx] = {
      ...memoryDeals[dealIdx],
      stage: stageId,
      probability: newProbability,
      updatedAt: new Date().toISOString().split("T")[0],
    };
    persistStorage(STORAGE_KEY_DEALS, memoryDeals);
  }

  return updated;
}

// ==========================================
// 8. Lead Conversion Workflow
// ==========================================
export type ConvertLeadParams = {
  leadId: string;
  createContact: boolean;
  contactId?: string;
  contactData?: {
    name: string;
    email: string;
    phone: string;
    designation?: string;
  };
  createCompany: boolean;
  companyId?: string;
  companyData?: {
    name: string;
    industry: string;
    website?: string;
    city?: string;
  };
  createDeal: boolean;
  dealData?: {
    title: string;
    value: number;
    stage: string;
    expectedCloseDate?: string;
  };
};

export async function convertLead(params: ConvertLeadParams): Promise<{
  contact?: Contact;
  company?: Company;
  deal?: Deal;
  lead: Lead;
}> {
  ensureInitialized();
  const lead = memoryLeads.find((l) => l.id === params.leadId);
  if (!lead) throw new Error(`Lead ${params.leadId} not found.`);

  const now = new Date().toISOString().split("T")[0];
  let finalCompany: Company | undefined;
  let finalContact: Contact | undefined;
  let finalDeal: Deal | undefined;

  // 1. Resolve Company
  if (params.createCompany && params.companyData?.name) {
    // Check duplicate by name
    const existingComp = memoryCompanies.find(
      (c) => c.name.toLowerCase() === params.companyData!.name.toLowerCase()
    );
    if (existingComp) {
      finalCompany = existingComp;
    } else {
      const compId = `COM-${String(memoryCompanies.length + 1).padStart(3, "0")}`;
      finalCompany = {
        id: compId,
        name: params.companyData.name,
        industry: params.companyData.industry || "SaaS & Technology",
        website: params.companyData.website || "",
        companySize: "11-50",
        businessEmail: lead.email || "",
        businessPhone: lead.phone || "",
        city: params.companyData.city || "Mumbai",
        country: "India",
        owner: lead.owner || "Sales Executive A",
        lifecycleStatus: "active",
        tags: ["Converted Lead", lead.source],
        contactIds: [],
        dealIds: [],
        annualRevenue: lead.value * 12,
        createdAt: now,
        updatedAt: now,
      };
      memoryCompanies = [finalCompany, ...memoryCompanies];
      persistStorage(STORAGE_KEY_COMPANIES, memoryCompanies);
    }
  } else if (params.companyId) {
    finalCompany = memoryCompanies.find((c) => c.id === params.companyId);
  }

  // 2. Resolve Contact
  if (params.createContact && params.contactData?.name) {
    // Check duplicate by email
    const existingCont = memoryContacts.find(
      (c) => c.email.toLowerCase() === params.contactData!.email.toLowerCase()
    );
    if (existingCont) {
      finalContact = existingCont;
    } else {
      const contId = `CON-${String(memoryContacts.length + 1).padStart(3, "0")}`;
      const initials = params.contactData.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      finalContact = {
        id: contId,
        name: params.contactData.name,
        avatar: initials,
        companyId: finalCompany?.id,
        companyName: finalCompany?.name || lead.company,
        designation: params.contactData.designation || "Director",
        email: params.contactData.email || lead.email,
        phone: params.contactData.phone || lead.phone || "+91 90000 00000",
        whatsapp: params.contactData.phone || lead.phone,
        location: `${finalCompany?.city || "Mumbai"}, India`,
        website: finalCompany?.website,
        owner: lead.owner || "Sales Executive A",
        lifecycleStatus: "customer",
        source: lead.source,
        relationshipScore: Math.max(70, lead.score),
        tags: ["Converted", lead.source],
        notes: lead.notes,
        isFavorite: true,
        leadId: lead.id,
        dealIds: [],
        createdAt: now,
        updatedAt: now,
      };
      memoryContacts = [finalContact, ...memoryContacts];
      persistStorage(STORAGE_KEY_CONTACTS, memoryContacts);

      // Link contact to company
      if (finalCompany && !finalCompany.contactIds.includes(contId)) {
        finalCompany.contactIds = [...finalCompany.contactIds, contId];
        persistStorage(STORAGE_KEY_COMPANIES, memoryCompanies);
      }
    }
  } else if (params.contactId) {
    finalContact = memoryContacts.find((c) => c.id === params.contactId);
  }

  // 3. Resolve Deal (if requested)
  if (params.createDeal) {
    const dealId = `DL-${String(memoryDeals.length + 101).padStart(3, "0")}`;
    finalDeal = {
      id: dealId,
      title:
        params.dealData?.title ||
        `${finalCompany?.name || lead.company} - Opportunity`,
      companyId: finalCompany?.id,
      companyName: finalCompany?.name || lead.company,
      contactId: finalContact?.id,
      contactName: finalContact?.name || lead.name,
      value: params.dealData?.value ?? lead.value,
      stage: params.dealData?.stage || lead.stage || "qualified",
      probability: getStageDefaultProbability(
        params.dealData?.stage || lead.stage || "qualified"
      ),
      expectedCloseDate:
        params.dealData?.expectedCloseDate ||
        lead.expectedCloseDate ||
        new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      priority: lead.priority || "high",
      owner: lead.owner || "Sales Executive A",
      source: lead.source,
      notes: lead.notes,
      leadId: lead.id,
      createdAt: now,
      updatedAt: now,
    };
    memoryDeals = [finalDeal, ...memoryDeals];
    persistStorage(STORAGE_KEY_DEALS, memoryDeals);

    // Link deal to contact and company
    if (finalContact) {
      finalContact.dealIds = [...(finalContact.dealIds || []), dealId];
      persistStorage(STORAGE_KEY_CONTACTS, memoryContacts);
    }
    if (finalCompany) {
      finalCompany.dealIds = [...(finalCompany.dealIds || []), dealId];
      persistStorage(STORAGE_KEY_COMPANIES, memoryCompanies);
    }
  }

  // 4. Update Lead Record with conversion details
  const convEvent = {
    id: `t-${Date.now()}`,
    type: "conversion" as const,
    description: `Lead converted to Contact (${finalContact?.name || "N/A"}) and Company (${finalCompany?.name || "N/A"})`,
    timestamp: "Just now",
    author: lead.owner || "Sales Executive A",
  };

  const updatedLead: Lead = {
    ...lead,
    isConverted: true,
    convertedContactId: finalContact?.id,
    convertedCompanyId: finalCompany?.id,
    convertedDealId: finalDeal?.id,
    timeline: [convEvent, ...(lead.timeline || [])],
  };

  const lIdx = memoryLeads.findIndex((l) => l.id === lead.id);
  if (lIdx !== -1) {
    memoryLeads[lIdx] = updatedLead;
    persistStorage(STORAGE_KEY_LEADS, memoryLeads);
  }

  // 5. Log Activity
  const activity: CRMActivity = {
    id: `act-${Date.now()}`,
    type: "lead_converted",
    title: "Lead Converted to Account",
    description: `Successfully converted lead ${lead.name} (${lead.company}) into unified customer workspace.`,
    timestamp: "Just now",
    author: lead.owner || "Sales Executive A",
    entityType: "contact",
    entityId: finalContact?.id || lead.id,
  };
  memoryActivities = [activity, ...memoryActivities];
  persistStorage(STORAGE_KEY_ACTIVITIES, memoryActivities);

  return {
    contact: finalContact,
    company: finalCompany,
    deal: finalDeal,
    lead: updatedLead,
  };
}

// ==========================================
// 9. Repository Methods — Contacts
// ==========================================
export async function listContacts(): Promise<Contact[]> {
  ensureInitialized();
  return [...memoryContacts];
}

export async function getContact(id: string): Promise<Contact | undefined> {
  ensureInitialized();
  return memoryContacts.find((c) => c.id === id);
}

export async function createContact(
  data: Omit<Contact, "id" | "createdAt" | "updatedAt">
): Promise<Contact> {
  ensureInitialized();
  const id = `CON-${String(memoryContacts.length + 1).padStart(3, "0")}`;
  const now = new Date().toISOString().split("T")[0];
  const initials = data.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const newContact: Contact = {
    ...data,
    id,
    avatar: data.avatar || initials,
    dealIds: data.dealIds || [],
    createdAt: now,
    updatedAt: now,
  };

  memoryContacts = [newContact, ...memoryContacts];
  persistStorage(STORAGE_KEY_CONTACTS, memoryContacts);

  // Link to company if companyId specified
  if (data.companyId) {
    const compIdx = memoryCompanies.findIndex((c) => c.id === data.companyId);
    if (compIdx !== -1) {
      memoryCompanies[compIdx].contactIds = [
        ...memoryCompanies[compIdx].contactIds,
        id,
      ];
      persistStorage(STORAGE_KEY_COMPANIES, memoryCompanies);
    }
  }

  // Log activity
  await logActivity({
    type: "contact_created",
    title: "Contact Created",
    description: `Created contact profile for ${newContact.name}`,
    author: newContact.owner || "Current User",
    entityType: "contact",
    entityId: id,
  });

  return newContact;
}

export async function updateContact(
  id: string,
  updates: Partial<Contact>
): Promise<Contact> {
  ensureInitialized();
  const index = memoryContacts.findIndex((c) => c.id === id);
  if (index === -1) throw new Error(`Contact ${id} not found.`);

  const existing = memoryContacts[index];
  const updated: Contact = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString().split("T")[0],
  };

  memoryContacts[index] = updated;
  persistStorage(STORAGE_KEY_CONTACTS, memoryContacts);
  return updated;
}

export async function deleteContact(id: string): Promise<void> {
  ensureInitialized();
  memoryContacts = memoryContacts.filter((c) => c.id !== id);
  persistStorage(STORAGE_KEY_CONTACTS, memoryContacts);
}

// ==========================================
// 10. Repository Methods — Companies
// ==========================================
export async function listCompanies(): Promise<Company[]> {
  ensureInitialized();
  return [...memoryCompanies];
}

export async function getCompany(id: string): Promise<Company | undefined> {
  ensureInitialized();
  return memoryCompanies.find((c) => c.id === id);
}

export async function createCompany(
  data: Omit<Company, "id" | "createdAt" | "updatedAt">
): Promise<Company> {
  ensureInitialized();
  const id = `COM-${String(memoryCompanies.length + 1).padStart(3, "0")}`;
  const now = new Date().toISOString().split("T")[0];

  const newCompany: Company = {
    ...data,
    id,
    contactIds: data.contactIds || [],
    dealIds: data.dealIds || [],
    createdAt: now,
    updatedAt: now,
  };

  memoryCompanies = [newCompany, ...memoryCompanies];
  persistStorage(STORAGE_KEY_COMPANIES, memoryCompanies);
  return newCompany;
}

export async function updateCompany(
  id: string,
  updates: Partial<Company>
): Promise<Company> {
  ensureInitialized();
  const index = memoryCompanies.findIndex((c) => c.id === id);
  if (index === -1) throw new Error(`Company ${id} not found.`);

  const existing = memoryCompanies[index];
  const updated: Company = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString().split("T")[0],
  };

  memoryCompanies[index] = updated;
  persistStorage(STORAGE_KEY_COMPANIES, memoryCompanies);

  // If company name was updated, synchronize companyName in contacts and deals
  if (updates.name && updates.name !== existing.name) {
    memoryContacts = memoryContacts.map((c) =>
      c.companyId === id ? { ...c, companyName: updates.name } : c
    );
    persistStorage(STORAGE_KEY_CONTACTS, memoryContacts);

    memoryDeals = memoryDeals.map((d) =>
      d.companyId === id ? { ...d, companyName: updates.name! } : d
    );
    persistStorage(STORAGE_KEY_DEALS, memoryDeals);
  }

  return updated;
}

export async function deleteCompany(id: string): Promise<void> {
  ensureInitialized();
  memoryCompanies = memoryCompanies.filter((c) => c.id !== id);
  persistStorage(STORAGE_KEY_COMPANIES, memoryCompanies);
}

// ==========================================
// 11. Repository Methods — Deals
// ==========================================
export async function listDeals(): Promise<Deal[]> {
  ensureInitialized();
  return [...memoryDeals];
}

export async function getDeal(id: string): Promise<Deal | undefined> {
  ensureInitialized();
  return memoryDeals.find((d) => d.id === id);
}

export async function createDeal(
  data: Omit<Deal, "id" | "createdAt" | "updatedAt">
): Promise<Deal> {
  ensureInitialized();
  const id = `DL-${String(memoryDeals.length + 101).padStart(3, "0")}`;
  const now = new Date().toISOString().split("T")[0];

  const newDeal: Deal = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  memoryDeals = [newDeal, ...memoryDeals];
  persistStorage(STORAGE_KEY_DEALS, memoryDeals);

  // Link to contact and company
  if (data.contactId) {
    const cIdx = memoryContacts.findIndex((c) => c.id === data.contactId);
    if (cIdx !== -1) {
      memoryContacts[cIdx].dealIds = [...(memoryContacts[cIdx].dealIds || []), id];
      persistStorage(STORAGE_KEY_CONTACTS, memoryContacts);
    }
  }

  if (data.companyId) {
    const compIdx = memoryCompanies.findIndex((c) => c.id === data.companyId);
    if (compIdx !== -1) {
      memoryCompanies[compIdx].dealIds = [
        ...(memoryCompanies[compIdx].dealIds || []),
        id,
      ];
      persistStorage(STORAGE_KEY_COMPANIES, memoryCompanies);
    }
  }

  // Also reflect in Leads store for Pipeline backwards compatibility
  const newLeadEquivalent: Lead = {
    id,
    name: data.contactName || "Contact Person",
    company: data.companyName,
    email: "",
    source: data.source || "Manual",
    stage: data.stage,
    score: 80,
    owner: data.owner,
    value: data.value,
    probability: data.probability,
    expectedCloseDate: data.expectedCloseDate,
    priority: data.priority,
    notes: data.notes,
    createdAt: now,
  };
  memoryLeads = [newLeadEquivalent, ...memoryLeads];
  persistStorage(STORAGE_KEY_LEADS, memoryLeads);

  // Log activity
  await logActivity({
    type: "deal_created",
    title: "New Deal Created",
    description: `Created opportunity '${newDeal.title}' valued at ₹${newDeal.value.toLocaleString(
      "en-IN"
    )}`,
    author: newDeal.owner || "Current User",
    entityType: "deal",
    entityId: id,
  });

  return newDeal;
}

export async function updateDeal(
  id: string,
  updates: Partial<Deal>
): Promise<Deal> {
  ensureInitialized();
  const index = memoryDeals.findIndex((d) => d.id === id);
  if (index === -1) throw new Error(`Deal ${id} not found.`);

  const existing = memoryDeals[index];
  const updated: Deal = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString().split("T")[0],
  };

  memoryDeals[index] = updated;
  persistStorage(STORAGE_KEY_DEALS, memoryDeals);

  // Sync to Leads store
  const leadIdx = memoryLeads.findIndex((l) => l.id === id);
  if (leadIdx !== -1) {
    memoryLeads[leadIdx] = {
      ...memoryLeads[leadIdx],
      value: updated.value,
      stage: updated.stage,
      probability: updated.probability,
      expectedCloseDate: updated.expectedCloseDate,
      priority: updated.priority,
      notes: updated.notes,
    };
    persistStorage(STORAGE_KEY_LEADS, memoryLeads);
  }

  return updated;
}

// ==========================================
// 12. Repository Methods — Stages
// ==========================================
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

// ==========================================
// 13. Activities, Notes, Files, Tasks
// ==========================================
export async function listActivities(
  entityType?: string,
  entityId?: string
): Promise<CRMActivity[]> {
  ensureInitialized();
  if (!entityType || !entityId) return [...memoryActivities];
  return memoryActivities.filter(
    (a) => a.entityType === entityType && a.entityId === entityId
  );
}

export async function logActivity(
  activity: Omit<CRMActivity, "id" | "timestamp"> & { timestamp?: string }
): Promise<CRMActivity> {
  ensureInitialized();
  const newAct: CRMActivity = {
    ...activity,
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: activity.timestamp || "Just now",
  };
  memoryActivities = [newAct, ...memoryActivities];
  persistStorage(STORAGE_KEY_ACTIVITIES, memoryActivities);
  return newAct;
}

export async function listNotes(
  entityType?: string,
  entityId?: string
): Promise<CRMNote[]> {
  ensureInitialized();
  if (!entityType || !entityId) return [...memoryNotes];
  return memoryNotes.filter(
    (n) => n.entityType === entityType && n.entityId === entityId
  );
}

export async function createNote(
  note: Omit<CRMNote, "id" | "createdAt">
): Promise<CRMNote> {
  ensureInitialized();
  const newNote: CRMNote = {
    ...note,
    id: `note-${Date.now()}`,
    createdAt: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
  memoryNotes = [newNote, ...memoryNotes];
  persistStorage(STORAGE_KEY_NOTES, memoryNotes);

  // Log activity
  await logActivity({
    type: "note_added",
    title: "Note Added",
    description: `Added note: "${newNote.content.slice(0, 60)}..."`,
    author: newNote.author,
    entityType: newNote.entityType,
    entityId: newNote.entityId,
  });

  return newNote;
}

export async function deleteNote(id: string): Promise<void> {
  ensureInitialized();
  memoryNotes = memoryNotes.filter((n) => n.id !== id);
  persistStorage(STORAGE_KEY_NOTES, memoryNotes);
}

export async function listFiles(
  entityType?: string,
  entityId?: string
): Promise<CRMFile[]> {
  ensureInitialized();
  if (!entityType || !entityId) return [...memoryFiles];
  return memoryFiles.filter(
    (f) => f.entityType === entityType && f.entityId === entityId
  );
}

export async function addFile(
  file: Omit<CRMFile, "id" | "uploadedAt">
): Promise<CRMFile> {
  ensureInitialized();
  const newFile: CRMFile = {
    ...file,
    id: `file-${Date.now()}`,
    uploadedAt: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
  memoryFiles = [newFile, ...memoryFiles];
  persistStorage(STORAGE_KEY_FILES, memoryFiles);

  await logActivity({
    type: "file_attached",
    title: "File Attached",
    description: `Attached file: ${newFile.name} (${(
      newFile.size /
      (1024 * 1024)
    ).toFixed(2)} MB)`,
    author: newFile.uploader,
    entityType: newFile.entityType,
    entityId: newFile.entityId,
  });

  return newFile;
}

export async function deleteFile(id: string): Promise<void> {
  ensureInitialized();
  memoryFiles = memoryFiles.filter((f) => f.id !== id);
  persistStorage(STORAGE_KEY_FILES, memoryFiles);
}

export async function getTasksFor(
  entityType?: string,
  entityId?: string
): Promise<CRMTask[]> {
  ensureInitialized();
  if (!entityType || !entityId) return [...memoryTasks];
  return memoryTasks.filter(
    (t) => t.entityType === entityType && t.entityId === entityId
  );
}

export async function listTasks(filter?: {
  status?: string;
  priority?: string;
  taskType?: string;
  assignedTo?: string;
  search?: string;
  entityType?: string;
  entityId?: string;
  overdueOnly?: boolean;
  todayOnly?: boolean;
  upcomingOnly?: boolean;
}): Promise<CRMTask[]> {
  ensureInitialized();
  const today = new Date().toISOString().split("T")[0];
  let list = [...memoryTasks];

  if (filter?.status && filter.status !== "all") {
    if (filter.status === "completed") {
      list = list.filter((t) => t.status === "completed");
    } else if (filter.status === "pending" || filter.status === "todo") {
      list = list.filter((t) => t.status === "todo" || t.status === "pending" || t.status === "in_progress" || t.status === "waiting");
    } else {
      list = list.filter((t) => t.status === filter.status);
    }
  }

  if (filter?.priority && filter.priority !== "all") {
    list = list.filter((t) => t.priority === filter.priority);
  }

  if (filter?.taskType && filter.taskType !== "all") {
    list = list.filter((t) => (t.taskType || "follow_up") === filter.taskType);
  }

  if (filter?.assignedTo && filter.assignedTo !== "all") {
    list = list.filter((t) => t.assignedTo === filter.assignedTo);
  }

  if (filter?.entityType && filter.entityType !== "all") {
    list = list.filter((t) => t.entityType === filter.entityType);
  }

  if (filter?.entityId) {
    list = list.filter((t) => t.entityId === filter.entityId);
  }

  if (filter?.overdueOnly) {
    list = list.filter(
      (t) => t.status !== "completed" && t.status !== "cancelled" && t.dueDate < today
    );
  }

  if (filter?.todayOnly) {
    list = list.filter((t) => t.dueDate === today);
  }

  if (filter?.upcomingOnly) {
    list = list.filter((t) => t.dueDate > today);
  }

  if (filter?.search && filter.search.trim()) {
    const q = filter.search.toLowerCase().trim();
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.entityName && t.entityName.toLowerCase().includes(q)) ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q)))
    );
  }

  // Sort by dueDate asc, priority desc
  return list.sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;
    if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    const pWeights: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
    return (pWeights[b.priority] || 1) - (pWeights[a.priority] || 1);
  });
}

export async function getTask(id: string): Promise<CRMTask | undefined> {
  ensureInitialized();
  return memoryTasks.find((t) => t.id === id);
}

export async function createTask(
  task: Partial<CRMTask> & { title: string }
): Promise<CRMTask> {
  ensureInitialized();
  const today = new Date().toISOString().split("T")[0];
  const newTask: CRMTask = {
    id: task.id || `task-${Date.now()}`,
    title: task.title.trim(),
    description: task.description || "",
    taskType: task.taskType || "follow_up",
    priority: task.priority || "medium",
    status: task.status || "todo",
    assignedTo: task.assignedTo || "Sales Executive A",
    createdBy: task.createdBy || "Sales Executive A",
    dueDate: task.dueDate || today,
    dueTime: task.dueTime || "12:00",
    startDate: task.startDate,
    startTime: task.startTime,
    estimatedDuration: task.estimatedDuration || 30,
    entityType: task.entityType,
    entityId: task.entityId,
    entityName: task.entityName,
    checklist: task.checklist || [],
    comments: task.comments || [],
    recurrenceRule: task.recurrenceRule,
    reminderMinutesBefore: task.reminderMinutesBefore,
    tags: task.tags || [],
    createdAt: task.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryTasks = [newTask, ...memoryTasks];
  persistStorage(STORAGE_KEY_TASKS, memoryTasks);

  // If task has entity association, log activity
  if (newTask.entityType && newTask.entityId) {
    try {
      await logActivity({
        entityType: newTask.entityType === "deal" ? "lead" : newTask.entityType === "conversation" ? "contact" : (newTask.entityType as any),
        entityId: newTask.entityId,
        type: "task_created",
        title: `Task Created: ${newTask.title}`,
        description: `Scheduled for ${newTask.dueDate} · Priority: ${newTask.priority.toUpperCase()}`,
        author: newTask.assignedTo,
      });
    } catch {
      // Graceful fallback for non-lead entities
    }
  }

  return newTask;
}

export async function updateTask(
  id: string,
  updates: Partial<CRMTask>
): Promise<CRMTask> {
  ensureInitialized();
  const tIdx = memoryTasks.findIndex((t) => t.id === id);
  if (tIdx === -1) throw new Error(`Task ${id} not found.`);

  const existing = memoryTasks[tIdx];
  const updated: CRMTask = {
    ...existing,
    ...updates,
    id: existing.id,
    updatedAt: new Date().toISOString(),
  };

  if (updates.status === "completed" && existing.status !== "completed") {
    updated.completedAt = new Date().toISOString();
  } else if (updates.status && updates.status !== "completed") {
    updated.completedAt = undefined;
  }

  memoryTasks[tIdx] = updated;
  persistStorage(STORAGE_KEY_TASKS, memoryTasks);
  return updated;
}

export async function toggleTask(id: string): Promise<CRMTask> {
  ensureInitialized();
  const tIdx = memoryTasks.findIndex((t) => t.id === id);
  if (tIdx === -1) throw new Error(`Task ${id} not found.`);

  const current = memoryTasks[tIdx];
  const willComplete = current.status !== "completed";

  const updated: CRMTask = {
    ...current,
    status: willComplete ? "completed" : "todo",
    completedAt: willComplete ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString(),
  };

  memoryTasks[tIdx] = updated;
  persistStorage(STORAGE_KEY_TASKS, memoryTasks);

  if (willComplete && current.entityType && current.entityId) {
    try {
      await logActivity({
        entityType: current.entityType === "deal" ? "lead" : current.entityType === "conversation" ? "contact" : (current.entityType as any),
        entityId: current.entityId,
        type: "task_completed",
        title: `Task Completed: ${current.title}`,
        description: `Completed by ${current.assignedTo} on ${new Date().toISOString().split("T")[0]}`,
        author: current.assignedTo,
      });
    } catch {
      // Graceful activity fallback
    }
  }

  return updated;
}

export async function rescheduleTask(
  id: string,
  newDueDate: string,
  newDueTime?: string
): Promise<CRMTask> {
  ensureInitialized();
  const tIdx = memoryTasks.findIndex((t) => t.id === id);
  if (tIdx === -1) throw new Error(`Task ${id} not found.`);

  const updated: CRMTask = {
    ...memoryTasks[tIdx],
    dueDate: newDueDate,
    dueTime: newDueTime || memoryTasks[tIdx].dueTime,
    status: memoryTasks[tIdx].status === "completed" ? "todo" : memoryTasks[tIdx].status,
    completedAt: undefined,
    updatedAt: new Date().toISOString(),
  };

  memoryTasks[tIdx] = updated;
  persistStorage(STORAGE_KEY_TASKS, memoryTasks);
  return updated;
}

export async function deleteTask(id: string): Promise<void> {
  ensureInitialized();
  memoryTasks = memoryTasks.filter((t) => t.id !== id);
  persistStorage(STORAGE_KEY_TASKS, memoryTasks);
}

export async function generateRecurringOccurrences(
  taskId: string,
  maxCount: number = 6
): Promise<CRMTask[]> {
  ensureInitialized();
  const parent = memoryTasks.find((t) => t.id === taskId);
  if (!parent || !parent.recurrenceRule) return [];

  const rule = parent.recurrenceRule;
  const newOccurrences: CRMTask[] = [];
  let baseDate = new Date(parent.dueDate);

  for (let i = 1; i <= Math.min(maxCount, rule.maxOccurrences || 6); i++) {
    const nextDate = new Date(baseDate);
    if (rule.frequency === "daily") {
      nextDate.setDate(nextDate.getDate() + (rule.interval || 1) * i);
    } else if (rule.frequency === "weekly") {
      nextDate.setDate(nextDate.getDate() + 7 * (rule.interval || 1) * i);
    } else if (rule.frequency === "monthly") {
      nextDate.setMonth(nextDate.getMonth() + (rule.interval || 1) * i);
    } else {
      nextDate.setDate(nextDate.getDate() + (rule.interval || 1) * i);
    }

    const nextDateStr = nextDate.toISOString().split("T")[0];
    if (rule.endDate && nextDateStr > rule.endDate) break;

    const occurrenceId = `${parent.id}-rec-${i}`;
    if (memoryTasks.some((t) => t.id === occurrenceId)) continue;

    const child: CRMTask = {
      ...parent,
      id: occurrenceId,
      dueDate: nextDateStr,
      status: "todo",
      completedAt: undefined,
      recurrenceParentId: parent.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newOccurrences.push(child);
  }

  if (newOccurrences.length > 0) {
    memoryTasks = [...memoryTasks, ...newOccurrences];
    persistStorage(STORAGE_KEY_TASKS, memoryTasks);
  }

  return newOccurrences;
}

// ==========================================
// 13B. Meetings Workspace Methods
// ==========================================

export async function listMeetings(filter?: {
  status?: string;
  host?: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  date?: string;
  search?: string;
}): Promise<CRMMeeting[]> {
  ensureInitialized();
  let list = [...memoryMeetings];

  if (filter?.status && filter.status !== "all") {
    list = list.filter((m) => m.status === filter.status);
  }

  if (filter?.host && filter.host !== "all") {
    list = list.filter((m) => m.host === filter.host);
  }

  if (filter?.contactId) {
    list = list.filter((m) => m.contactId === filter.contactId);
  }

  if (filter?.companyId) {
    list = list.filter((m) => m.companyId === filter.companyId);
  }

  if (filter?.dealId) {
    list = list.filter((m) => m.dealId === filter.dealId);
  }

  if (filter?.date) {
    list = list.filter((m) => m.date === filter.date);
  }

  if (filter?.search && filter.search.trim()) {
    const q = filter.search.toLowerCase().trim();
    list = list.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.agenda && m.agenda.toLowerCase().includes(q)) ||
        (m.relatedEntityName && m.relatedEntityName.toLowerCase().includes(q)) ||
        m.participants.some((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
    );
  }

  return list.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });
}

export async function getMeeting(id: string): Promise<CRMMeeting | undefined> {
  ensureInitialized();
  return memoryMeetings.find((m) => m.id === id);
}

export async function createMeeting(
  data: Partial<CRMMeeting> & { title: string; date: string; startTime: string; endTime: string }
): Promise<CRMMeeting> {
  ensureInitialized();
  const newMeeting: CRMMeeting = {
    id: data.id || `meet-${Date.now()}`,
    title: data.title.trim(),
    meetingType: data.meetingType || "discovery",
    status: data.status || "scheduled",
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    timezone: data.timezone || "Asia/Kolkata",
    host: data.host || "Sales Executive A",
    participants: data.participants || [
      { name: "Sales Executive A", email: "praveen@bizlead.io", role: "Host", avatar: "SE" },
    ],
    location: data.location || "Google Meet",
    meetingUrl: data.meetingUrl,
    agenda: data.agenda || "Agenda topics to be discussed.",
    prepNotes: data.prepNotes,
    contactId: data.contactId,
    companyId: data.companyId,
    dealId: data.dealId,
    leadId: data.leadId,
    conversationId: data.conversationId,
    relatedEntityName: data.relatedEntityName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryMeetings = [newMeeting, ...memoryMeetings];
  persistStorage(STORAGE_KEY_MEETINGS, memoryMeetings);

  // Log activity
  if (newMeeting.contactId) {
    try {
      await logActivity({
        entityType: "contact",
        entityId: newMeeting.contactId,
        type: "meeting_scheduled",
        title: `Meeting Scheduled: ${newMeeting.title}`,
        description: `${newMeeting.date} at ${newMeeting.startTime} - ${newMeeting.endTime} (${newMeeting.location || "Online"})`,
        author: newMeeting.host,
      });
    } catch {
      // fallback
    }
  }

  return newMeeting;
}

export async function updateMeeting(
  id: string,
  updates: Partial<CRMMeeting>
): Promise<CRMMeeting> {
  ensureInitialized();
  const mIdx = memoryMeetings.findIndex((m) => m.id === id);
  if (mIdx === -1) throw new Error(`Meeting ${id} not found.`);

  const existing = memoryMeetings[mIdx];
  const updated: CRMMeeting = {
    ...existing,
    ...updates,
    id: existing.id,
    updatedAt: new Date().toISOString(),
  };

  memoryMeetings[mIdx] = updated;
  persistStorage(STORAGE_KEY_MEETINGS, memoryMeetings);
  return updated;
}

export async function completeMeeting(
  id: string,
  outcome: MeetingOutcome,
  nextSteps?: string[]
): Promise<CRMMeeting> {
  ensureInitialized();
  const mIdx = memoryMeetings.findIndex((m) => m.id === id);
  if (mIdx === -1) throw new Error(`Meeting ${id} not found.`);

  const meeting = memoryMeetings[mIdx];
  const updated: CRMMeeting = {
    ...meeting,
    status: "completed",
    outcome,
    updatedAt: new Date().toISOString(),
  };

  memoryMeetings[mIdx] = updated;
  persistStorage(STORAGE_KEY_MEETINGS, memoryMeetings);

  // 1. Log activity to CRM timeline
  if (meeting.contactId) {
    try {
      await logActivity({
        entityType: "contact",
        entityId: meeting.contactId,
        type: "meeting_completed",
        title: `Meeting Completed: ${meeting.title}`,
        description: `Outcome: ${outcome.summary} · Sentiment: ${outcome.sentiment.toUpperCase()}`,
        author: meeting.host,
      });
    } catch {
      // fallback
    }
  }

  // 2. If next steps provided, create follow-up task without duplicates
  if (nextSteps && nextSteps.length > 0) {
    for (const step of nextSteps) {
      if (!step.trim()) continue;
      const today = new Date();
      today.setDate(today.getDate() + 2);
      const followUpDate = today.toISOString().split("T")[0];

      await createTask({
        title: `Follow-up: ${step.trim()}`,
        description: `Generated from meeting "${meeting.title}" outcome.`,
        taskType: "follow_up",
        priority: "high",
        dueDate: followUpDate,
        dueTime: "11:00",
        assignedTo: meeting.host,
        entityType: meeting.contactId ? "contact" : meeting.leadId ? "lead" : "company",
        entityId: meeting.contactId || meeting.leadId || meeting.companyId,
        entityName: meeting.relatedEntityName,
      });
    }
  }

  // 3. Update deal stage if specified
  if (outcome.updatedDealStage && meeting.dealId) {
    try {
      await updateLead(meeting.dealId, { stage: outcome.updatedDealStage as any });
    } catch {
      // fallback
    }
  }

  return updated;
}

export async function cancelMeeting(
  id: string,
  reason?: string
): Promise<CRMMeeting> {
  ensureInitialized();
  const mIdx = memoryMeetings.findIndex((m) => m.id === id);
  if (mIdx === -1) throw new Error(`Meeting ${id} not found.`);

  const updated: CRMMeeting = {
    ...memoryMeetings[mIdx],
    status: "cancelled",
    prepNotes: reason
      ? `${memoryMeetings[mIdx].prepNotes || ""}\nCancelled reason: ${reason}`
      : memoryMeetings[mIdx].prepNotes,
    updatedAt: new Date().toISOString(),
  };

  memoryMeetings[mIdx] = updated;
  persistStorage(STORAGE_KEY_MEETINGS, memoryMeetings);
  return updated;
}

export async function deleteMeeting(id: string): Promise<void> {
  ensureInitialized();
  memoryMeetings = memoryMeetings.filter((m) => m.id !== id);
  persistStorage(STORAGE_KEY_MEETINGS, memoryMeetings);
}

// ==========================================
// 13C. Reminders & Local Notifications Methods
// ==========================================

export async function listReminders(): Promise<CRMReminder[]> {
  ensureInitialized();
  return [...memoryReminders].sort((a, b) => b.dueAt.localeCompare(a.dueAt));
}

export async function createReminder(
  data: Omit<CRMReminder, "id" | "createdAt" | "isRead" | "isDismissed">
): Promise<CRMReminder> {
  ensureInitialized();
  const newReminder: CRMReminder = {
    ...data,
    id: `rem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    isRead: false,
    isDismissed: false,
    createdAt: new Date().toISOString(),
  };
  memoryReminders = [newReminder, ...memoryReminders];
  persistStorage(STORAGE_KEY_REMINDERS, memoryReminders);
  return newReminder;
}

export async function markReminderRead(id: string): Promise<void> {
  ensureInitialized();
  memoryReminders = memoryReminders.map((r) =>
    r.id === id ? { ...r, isRead: true } : r
  );
  persistStorage(STORAGE_KEY_REMINDERS, memoryReminders);
}

export async function markAllRemindersRead(): Promise<void> {
  ensureInitialized();
  memoryReminders = memoryReminders.map((r) => ({ ...r, isRead: true }));
  persistStorage(STORAGE_KEY_REMINDERS, memoryReminders);
}

export async function dismissReminder(id: string): Promise<void> {
  ensureInitialized();
  memoryReminders = memoryReminders.map((r) =>
    r.id === id ? { ...r, isDismissed: true, isRead: true } : r
  );
  persistStorage(STORAGE_KEY_REMINDERS, memoryReminders);
}

export async function snoozeReminder(id: string, minutes: number = 30): Promise<void> {
  ensureInitialized();
  const snoozedUntil = new Date(Date.now() + minutes * 60000).toISOString();
  memoryReminders = memoryReminders.map((r) =>
    r.id === id ? { ...r, snoozedUntil, isRead: true } : r
  );
  persistStorage(STORAGE_KEY_REMINDERS, memoryReminders);
}

// ==========================================
// 13D. Smart Follow-up Recommendation Engine
// ==========================================

export async function getSmartFollowUpRecommendations(): Promise<SmartRecommendation[]> {
  ensureInitialized();
  const today = new Date().toISOString().split("T")[0];
  const recs: SmartRecommendation[] = [];

  // Rule 1: New lead without scheduled follow-up
  for (const lead of memoryLeads) {
    if (lead.stage === "new" || lead.stage === "contacted") {
      const hasTask = memoryTasks.some(
        (t) => (t.entityId === lead.id || t.entityName?.includes(lead.name)) && t.status !== "completed"
      );
      const recId = `rec-lead-${lead.id}`;
      if (!hasTask && !memoryDismissedRecs.includes(recId)) {
        recs.push({
          id: recId,
          ruleId: "new_lead_no_followup",
          reason: `New lead "${lead.name}" (${lead.company}) has no upcoming follow-up scheduled.`,
          suggestedAction: `Schedule introductory qualification call with ${lead.name}`,
          suggestedDueDate: today,
          priority: lead.score > 80 ? "urgent" : "high",
          taskType: "call",
          entityType: "lead",
          entityId: lead.id,
          entityName: `${lead.name} · ${lead.company}`,
        });
      }
    }
  }

  // Rule 2: Overdue sales tasks (> 24 hours overdue)
  const overdueTasks = memoryTasks.filter(
    (t) => t.status !== "completed" && t.status !== "cancelled" && t.dueDate < today
  );
  for (const t of overdueTasks) {
    const recId = `rec-task-overdue-${t.id}`;
    if (!memoryDismissedRecs.includes(recId)) {
      recs.push({
        id: recId,
        ruleId: "overdue_sales_task",
        reason: `Task "${t.title}" is overdue since ${t.dueDate}.`,
        suggestedAction: `Reschedule or complete overdue task for ${t.assignedTo}`,
        suggestedDueDate: today,
        priority: "urgent",
        taskType: t.taskType || "follow_up",
        entityType: t.entityType || "lead",
        entityId: t.entityId || t.id,
        entityName: t.entityName || t.title,
      });
    }
  }

  // Rule 3: Proposal-stage deal without scheduled next step
  for (const lead of memoryLeads) {
    if (lead.stage === "proposal") {
      const hasFutureAction = memoryTasks.some(
        (t) => t.entityId === lead.id && t.dueDate >= today && t.status !== "completed"
      );
      const recId = `rec-proposal-${lead.id}`;
      if (!hasFutureAction && !memoryDismissedRecs.includes(recId)) {
        recs.push({
          id: recId,
          ruleId: "proposal_no_next_step",
          reason: `Deal for ${lead.company} (₹${(lead.value || 0).toLocaleString()}) is in Proposal stage with no next step scheduled.`,
          suggestedAction: `Send proposal follow-up & confirm review timeline with ${lead.name}`,
          suggestedDueDate: today,
          priority: "high",
          taskType: "proposal",
          entityType: "deal",
          entityId: lead.id,
          entityName: `${lead.name} · ${lead.company}`,
        });
      }
    }
  }

  // Rule 4: Completed meeting without recorded next steps
  for (const meeting of memoryMeetings) {
    if (meeting.status === "completed" && (!meeting.outcome || !meeting.outcome.nextSteps || meeting.outcome.nextSteps.length === 0)) {
      const recId = `rec-meeting-${meeting.id}`;
      if (!memoryDismissedRecs.includes(recId)) {
        recs.push({
          id: recId,
          ruleId: "meeting_without_next_steps",
          reason: `Meeting "${meeting.title}" completed without recorded action items or next steps.`,
          suggestedAction: `Log meeting outcome summary & assign next-step tasks for ${meeting.relatedEntityName || "client"}`,
          suggestedDueDate: today,
          priority: "medium",
          taskType: "follow_up",
          entityType: "meeting",
          entityId: meeting.id,
          entityName: meeting.relatedEntityName || meeting.title,
        });
      }
    }
  }

  // Rule 5: Inbound conversation awaiting response
  for (const conv of memoryConversations) {
    if (conv.status === "open" && conv.unreadCount > 0) {
      const recId = `rec-conv-${conv.id}`;
      if (!memoryDismissedRecs.includes(recId)) {
        recs.push({
          id: recId,
          ruleId: "conversation_awaiting_response",
          reason: `Inbound inquiry from ${conv.participant.name} on ${conv.channel.toUpperCase()} has unread messages.`,
          suggestedAction: `Send reply to ${conv.participant.name} or convert to CRM lead`,
          suggestedDueDate: today,
          priority: "high",
          taskType: "whatsapp",
          entityType: "conversation",
          entityId: conv.id,
          entityName: `${conv.participant.name} (${conv.channel.toUpperCase()})`,
        });
      }
    }
  }

  return recs;
}

export async function dismissRecommendation(id: string): Promise<void> {
  ensureInitialized();
  if (!memoryDismissedRecs.includes(id)) {
    memoryDismissedRecs.push(id);
    persistStorage(STORAGE_KEY_DISMISSED_RECS, memoryDismissedRecs);
  }
}

export async function snoozeRecommendation(id: string, days: number = 2): Promise<void> {
  ensureInitialized();
  // Simply add to dismissed for now in demo mode
  await dismissRecommendation(id);
}

// ==========================================
// 13E. ICS Calendar Generator (RFC 5545)
// ==========================================

export function generateCalendarICS(events: (CRMTask | CRMMeeting)[]): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const formatICSDate = (dateStr: string, timeStr?: string) => {
    const cleanDate = dateStr.replace(/[^0-9]/g, "");
    if (!timeStr) {
      return `${cleanDate}`; // All day
    }
    const cleanTime = timeStr.replace(/[^0-9]/g, "");
    return `${cleanDate}T${cleanTime.padEnd(4, "0")}00`;
  };

  const escapeICS = (str?: string) => {
    if (!str) return "";
    return str
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  };

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BizLead Revenue OS//Focus Center Calendar 1.0//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:BizLead CRM Schedule",
    "X-WR-TIMEZONE:Asia/Kolkata",
  ];

  for (const ev of events) {
    const isMeeting = "startTime" in ev && "meetingType" in ev;
    const uid = `${ev.id}@bizlead.io`;
    const dtstamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtstamp}`);

    if (isMeeting) {
      const meet = ev as CRMMeeting;
      const dtstart = formatICSDate(meet.date, meet.startTime);
      const dtend = formatICSDate(meet.date, meet.endTime);
      lines.push(`DTSTART;TZID=Asia/Kolkata:${dtstart}`);
      lines.push(`DTEND;TZID=Asia/Kolkata:${dtend}`);
      lines.push(`SUMMARY:${escapeICS(meet.title)}`);
      lines.push(`DESCRIPTION:${escapeICS(`${meet.agenda}\nHost: ${meet.host}\nLink: ${meet.meetingUrl || meet.location || "N/A"}`)}`);
      if (meet.location || meet.meetingUrl) {
        lines.push(`LOCATION:${escapeICS(meet.meetingUrl || meet.location)}`);
      }
      lines.push(`STATUS:${meet.status === "completed" ? "CONFIRMED" : meet.status === "cancelled" ? "CANCELLED" : "CONFIRMED"}`);
    } else {
      const task = ev as CRMTask;
      const dtstart = formatICSDate(task.dueDate, task.dueTime);
      lines.push(`DTSTART:${dtstart}`);
      lines.push(`SUMMARY:${escapeICS(`[Task] ${task.title}`)}`);
      lines.push(`DESCRIPTION:${escapeICS(`${task.description || ""}\nPriority: ${task.priority.toUpperCase()}\nAssigned: ${task.assignedTo}`)}`);
      lines.push(`STATUS:${task.status === "completed" ? "COMPLETED" : "NEEDS-ACTION"}`);
    }

    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

// ==========================================
// 14. Global Reset to Demo Baseline
// ==========================================
export async function resetCRMData(): Promise<void> {
  memoryLeads = [...INITIAL_DEMO_LEADS];
  memoryStages = [...DEFAULT_PIPELINE_STAGES];
  memoryContacts = [...INITIAL_DEMO_CONTACTS];
  memoryCompanies = [...INITIAL_DEMO_COMPANIES];
  memoryDeals = [...INITIAL_DEMO_DEALS];
  memoryActivities = [...INITIAL_DEMO_ACTIVITIES];
  memoryNotes = [...INITIAL_DEMO_NOTES];
  memoryFiles = [...INITIAL_DEMO_FILES];
  memoryTasks = [...INITIAL_DEMO_TASKS];
  memoryMeetings = [...INITIAL_DEMO_MEETINGS];
  memoryReminders = [...INITIAL_DEMO_REMINDERS];
  memoryDismissedRecs = [];
  memoryConversations = [...INITIAL_DEMO_CONVERSATIONS];
  memoryMessages = [...INITIAL_DEMO_MESSAGES];
  memoryTemplates = [...INITIAL_DEMO_TEMPLATES];
  memoryChannels = [...INITIAL_DEMO_CHANNELS];

  persistStorage(STORAGE_KEY_LEADS, memoryLeads);
  persistStorage(STORAGE_KEY_STAGES, memoryStages);
  persistStorage(STORAGE_KEY_CONTACTS, memoryContacts);
  persistStorage(STORAGE_KEY_COMPANIES, memoryCompanies);
  persistStorage(STORAGE_KEY_DEALS, memoryDeals);
  persistStorage(STORAGE_KEY_ACTIVITIES, memoryActivities);
  persistStorage(STORAGE_KEY_NOTES, memoryNotes);
  persistStorage(STORAGE_KEY_FILES, memoryFiles);
  persistStorage(STORAGE_KEY_TASKS, memoryTasks);
  persistStorage(STORAGE_KEY_MEETINGS, memoryMeetings);
  persistStorage(STORAGE_KEY_REMINDERS, memoryReminders);
  persistStorage(STORAGE_KEY_DISMISSED_RECS, memoryDismissedRecs);
  persistStorage(STORAGE_KEY_CONVERSATIONS, memoryConversations);
  persistStorage(STORAGE_KEY_MESSAGES, memoryMessages);
  persistStorage(STORAGE_KEY_TEMPLATES, memoryTemplates);
  persistStorage(STORAGE_KEY_CHANNELS, memoryChannels);
}

// ==========================================
// 15. Unified Inbox & Communications Methods
// ==========================================

export async function listConversations(filter?: {
  status?: string;
  channel?: string;
  owner?: string;
  search?: string;
}): Promise<Conversation[]> {
  ensureInitialized();
  let list = [...memoryConversations];

  if (filter?.status && filter.status !== "all") {
    list = list.filter((c) => c.status === filter.status);
  }
  if (filter?.channel && filter.channel !== "all") {
    list = list.filter((c) => c.channel === filter.channel);
  }
  if (filter?.owner && filter.owner !== "all") {
    if (filter.owner === "unassigned") {
      list = list.filter((c) => !c.assignedOwner);
    } else {
      list = list.filter((c) => c.assignedOwner === filter.owner);
    }
  }
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.participant.name.toLowerCase().includes(q) ||
        c.participant.handleOrIdentifier.toLowerCase().includes(q) ||
        (c.lastMessage?.content || "").toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Sort by last activity descending
  return list.sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt).getTime() -
      new Date(a.updatedAt || a.createdAt).getTime()
  );
}

export async function getConversation(id: string): Promise<Conversation | null> {
  ensureInitialized();
  return memoryConversations.find((c) => c.id === id) || null;
}

export async function listMessages(conversationId: string): Promise<Message[]> {
  ensureInitialized();
  return memoryMessages
    .filter((m) => m.conversationId === conversationId)
    .sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
}

export async function sendMessage(params: {
  conversationId: string;
  content: string;
  senderName?: string;
  attachments?: Attachment[];
  isInternalNote?: boolean;
  replyToReferenceId?: string;
}): Promise<Message> {
  ensureInitialized();
  const convIndex = memoryConversations.findIndex(
    (c) => c.id === params.conversationId
  );
  if (convIndex === -1) {
    throw new Error(`Conversation ${params.conversationId} not found.`);
  }

  const conv = memoryConversations[convIndex];
  const now = new Date().toISOString();
  const newMsgId = `MSG-${String(memoryMessages.length + 101).padStart(3, "0")}`;

  const message: Message = {
    id: newMsgId,
    conversationId: params.conversationId,
    channel: conv.channel,
    senderType: "executive",
    senderName: params.senderName || conv.assignedOwner || "Sales Executive",
    content: params.content,
    timestamp: now,
    isInternalNote: Boolean(params.isInternalNote),
    deliveryStatus: params.isInternalNote ? undefined : "sent",
    attachments: params.attachments,
    replyToReferenceId: params.replyToReferenceId,
    isSimulatedDemo: true,
  };

  memoryMessages = [...memoryMessages, message];
  persistStorage(STORAGE_KEY_MESSAGES, memoryMessages);

  // Update conversation
  const updatedConv: Conversation = {
    ...conv,
    // If it's a customer-facing message, update lastMessage and reset unreadCount
    lastMessage: params.isInternalNote ? conv.lastMessage : message,
    unreadCount: 0,
    draftMessage: "", // Clear draft on successful send
    updatedAt: now,
  };
  memoryConversations[convIndex] = updatedConv;
  persistStorage(STORAGE_KEY_CONVERSATIONS, memoryConversations);

  // Log CRM Activity if linked to a Contact
  if (conv.contactId) {
    await logActivity({
      entityType: "contact",
      entityId: conv.contactId,
      type: params.isInternalNote ? "note_added" : "email",
      title: params.isInternalNote ? "Internal Note Added" : `${conv.channel.toUpperCase()} Message Sent`,
      description: params.isInternalNote
        ? `Internal note added in ${conv.channel.toUpperCase()} chat: "${params.content.slice(0, 60)}..."`
        : `Sent ${conv.channel.toUpperCase()} message to ${conv.participant.name}: "${params.content.slice(0, 60)}..."`,
      author: params.senderName || conv.assignedOwner || "Sales Executive",
      timestamp: now,
    });
  }

  // Simulate realistic background status transition: "sent" -> "delivered" after 1.5 seconds
  if (!params.isInternalNote && typeof window !== "undefined") {
    setTimeout(() => {
      const msgIdx = memoryMessages.findIndex((m) => m.id === newMsgId);
      if (msgIdx !== -1) {
        memoryMessages[msgIdx] = {
          ...memoryMessages[msgIdx],
          deliveryStatus: "delivered",
        };
        persistStorage(STORAGE_KEY_MESSAGES, memoryMessages);
      }
    }, 1500);
  }

  return message;
}

export async function updateConversationStatus(
  id: string,
  status: ConversationStatus
): Promise<Conversation> {
  ensureInitialized();
  const idx = memoryConversations.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Conversation ${id} not found.`);

  const prev = memoryConversations[idx];
  const now = new Date().toISOString();
  const updated: Conversation = {
    ...prev,
    status,
    updatedAt: now,
  };

  memoryConversations[idx] = updated;
  persistStorage(STORAGE_KEY_CONVERSATIONS, memoryConversations);

  // Log to CRM Activity timeline
  if (prev.contactId) {
    await logActivity({
      entityType: "contact",
      entityId: prev.contactId,
      type: "stage_change",
      title: "Conversation Status Updated",
      description: `Inbox conversation status changed to "${status}" on ${prev.channel.toUpperCase()}.`,
      author: prev.assignedOwner || "Sales Executive",
      timestamp: now,
    });
  }

  return updated;
}

export async function updateConversationPriority(
  id: string,
  priority: ConversationPriority
): Promise<Conversation> {
  ensureInitialized();
  const idx = memoryConversations.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Conversation ${id} not found.`);

  const updated: Conversation = {
    ...memoryConversations[idx],
    priority,
    updatedAt: new Date().toISOString(),
  };

  memoryConversations[idx] = updated;
  persistStorage(STORAGE_KEY_CONVERSATIONS, memoryConversations);
  return updated;
}

export async function assignConversation(
  id: string,
  owner: string
): Promise<Conversation> {
  ensureInitialized();
  const idx = memoryConversations.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Conversation ${id} not found.`);

  const prev = memoryConversations[idx];
  const now = new Date().toISOString();
  const updated: Conversation = {
    ...prev,
    assignedOwner: owner,
    updatedAt: now,
  };

  memoryConversations[idx] = updated;
  persistStorage(STORAGE_KEY_CONVERSATIONS, memoryConversations);

  if (prev.contactId) {
    await logActivity({
      entityType: "contact",
      entityId: prev.contactId,
      type: "note_added",
      title: "Conversation Reassigned",
      description: `Conversation assigned to ${owner}.`,
      author: "System",
      timestamp: now,
    });
  }

  return updated;
}

export async function markConversationRead(id: string): Promise<Conversation> {
  ensureInitialized();
  const idx = memoryConversations.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Conversation ${id} not found.`);

  const updated: Conversation = {
    ...memoryConversations[idx],
    unreadCount: 0,
    updatedAt: new Date().toISOString(),
  };

  memoryConversations[idx] = updated;
  persistStorage(STORAGE_KEY_CONVERSATIONS, memoryConversations);
  return updated;
}

export async function saveConversationDraft(
  id: string,
  draft: string
): Promise<Conversation> {
  ensureInitialized();
  const idx = memoryConversations.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Conversation ${id} not found.`);

  const updated: Conversation = {
    ...memoryConversations[idx],
    draftMessage: draft,
  };

  memoryConversations[idx] = updated;
  persistStorage(STORAGE_KEY_CONVERSATIONS, memoryConversations);
  return updated;
}

export async function listTemplates(): Promise<MessageTemplate[]> {
  ensureInitialized();
  return [...memoryTemplates];
}

export async function createTemplate(
  template: Omit<MessageTemplate, "id">
): Promise<MessageTemplate> {
  ensureInitialized();
  const newTemplate: MessageTemplate = {
    ...template,
    id: `TMP-${String(memoryTemplates.length + 101).padStart(3, "0")}`,
  };

  memoryTemplates = [newTemplate, ...memoryTemplates];
  persistStorage(STORAGE_KEY_TEMPLATES, memoryTemplates);
  return newTemplate;
}

export async function updateTemplate(
  id: string,
  updates: Partial<MessageTemplate>
): Promise<MessageTemplate> {
  ensureInitialized();
  const idx = memoryTemplates.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error(`Template ${id} not found.`);

  const updated: MessageTemplate = {
    ...memoryTemplates[idx],
    ...updates,
  };
  memoryTemplates[idx] = updated;
  persistStorage(STORAGE_KEY_TEMPLATES, memoryTemplates);
  return updated;
}

export async function deleteTemplate(id: string): Promise<void> {
  ensureInitialized();
  memoryTemplates = memoryTemplates.filter((t) => t.id !== id);
  persistStorage(STORAGE_KEY_TEMPLATES, memoryTemplates);
}

export async function listChannelConnections(): Promise<ChannelConnection[]> {
  ensureInitialized();
  return [...memoryChannels];
}

export async function updateChannelStatus(
  id: string,
  status: ChannelConnection["status"]
): Promise<ChannelConnection> {
  ensureInitialized();
  const idx = memoryChannels.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Channel ${id} not found.`);

  const updated: ChannelConnection = {
    ...memoryChannels[idx],
    status,
    lastSyncAt: new Date().toISOString(),
  };
  memoryChannels[idx] = updated;
  persistStorage(STORAGE_KEY_CHANNELS, memoryChannels);
  return updated;
}

export async function createLeadFromConversation(
  conversationId: string,
  leadData: {
    name: string;
    company: string;
    email?: string;
    phone?: string;
    value?: number;
    owner?: string;
    source?: string;
  }
): Promise<{ lead: Lead; conversation: Conversation }> {
  ensureInitialized();
  const conv = memoryConversations.find((c) => c.id === conversationId);
  if (!conv) throw new Error(`Conversation ${conversationId} not found.`);

  // 1. Create Lead in CRM repository
  const newLead = await createLead({
    name: leadData.name.trim() || conv.participant.name,
    company: leadData.company.trim() || "Independent / New Account",
    email: leadData.email || (conv.participant.handleOrIdentifier.includes("@") ? conv.participant.handleOrIdentifier : ""),
    phone: leadData.phone || (!conv.participant.handleOrIdentifier.includes("@") ? conv.participant.handleOrIdentifier : ""),
    source: leadData.source || (conv.channel === "whatsapp" ? "WhatsApp" : conv.channel === "instagram" ? "Instagram" : "Website"),
    stage: "new",
    score: 85, // High intent because they initiated inbound contact
    owner: leadData.owner || conv.assignedOwner || "Sales Executive A",
    value: leadData.value || 50000,
    probability: 30,
    expectedCloseDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    priority: "high",
    notes: `Captured directly from ${conv.channel.toUpperCase()} conversation with ${conv.participant.name}.`,
  });

  // 2. Create or associate Company
  const companyName = leadData.company.trim() || "Independent Account";
  let comp = memoryCompanies.find(
    (c) => c.name.toLowerCase() === companyName.toLowerCase()
  );
  if (!comp) {
    comp = {
      id: `COM-${String(memoryCompanies.length + 1).padStart(3, "0")}`,
      name: companyName,
      industry: "Design & Professional Services",
      website: "https://example.com",
      companySize: "11-50",
      businessEmail: leadData.email || "hello@example.com",
      businessPhone: leadData.phone || "+91 98000 00000",
      city: "Mumbai",
      country: "India",
      owner: leadData.owner || conv.assignedOwner || "Sales Executive A",
      lifecycleStatus: "prospect",
      accountNotes: `Account created via ${conv.channel.toUpperCase()} lead conversion.`,
      tags: ["Inbound", conv.channel.toUpperCase()],
      contactIds: [],
      dealIds: [newLead.id],
      annualRevenue: (newLead.value || 50000) * 12,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryCompanies.push(comp);
    persistStorage(STORAGE_KEY_COMPANIES, memoryCompanies);
  } else {
    comp.dealIds.push(newLead.id);
    persistStorage(STORAGE_KEY_COMPANIES, memoryCompanies);
  }

  // 3. Create Contact
  const newContact: Contact = {
    id: `CON-${String(memoryContacts.length + 1).padStart(3, "0")}`,
    name: leadData.name.trim() || conv.participant.name,
    email: leadData.email || (conv.participant.handleOrIdentifier.includes("@") ? conv.participant.handleOrIdentifier : ""),
    phone: leadData.phone || (!conv.participant.handleOrIdentifier.includes("@") ? conv.participant.handleOrIdentifier : ""),
    designation: "Founder / Prospect",
    companyId: comp.id,
    companyName: comp.name,
    owner: leadData.owner || conv.assignedOwner || "Sales Executive A",
    lifecycleStatus: "lead",
    source: conv.channel === "whatsapp" ? "WhatsApp" : conv.channel === "instagram" ? "Instagram" : "Website",
    relationshipScore: 85,
    tags: ["Inbound Lead", conv.channel.toUpperCase()],
    avatar: conv.participant.avatar || conv.participant.name.slice(0, 2).toUpperCase(),
    leadId: newLead.id,
    dealIds: [newLead.id],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  memoryContacts.push(newContact);
  comp.contactIds.push(newContact.id);
  persistStorage(STORAGE_KEY_CONTACTS, memoryContacts);
  persistStorage(STORAGE_KEY_COMPANIES, memoryCompanies);

  // 4. Link Lead, Contact, and Company to Conversation
  const convIdx = memoryConversations.findIndex((c) => c.id === conversationId);
  const updatedConv: Conversation = {
    ...conv,
    leadId: newLead.id,
    contactId: newContact.id,
    companyId: comp.id,
    tags: [...conv.tags.filter((t) => t !== "Inbound Lead"), "Lead Qualified"],
    updatedAt: new Date().toISOString(),
  };
  memoryConversations[convIdx] = updatedConv;
  persistStorage(STORAGE_KEY_CONVERSATIONS, memoryConversations);

  return { lead: newLead, conversation: updatedConv };
}

export async function associateConversationWithContact(
  conversationId: string,
  contactId: string,
  companyId?: string
): Promise<Conversation> {
  ensureInitialized();
  const convIdx = memoryConversations.findIndex((c) => c.id === conversationId);
  if (convIdx === -1) throw new Error(`Conversation ${conversationId} not found.`);

  const contact = memoryContacts.find((c) => c.id === contactId);
  if (!contact) throw new Error(`Contact ${contactId} not found.`);

  const conv = memoryConversations[convIdx];
  const updatedConv: Conversation = {
    ...conv,
    contactId: contact.id,
    companyId: companyId || contact.companyId,
    updatedAt: new Date().toISOString(),
  };

  memoryConversations[convIdx] = updatedConv;
  persistStorage(STORAGE_KEY_CONVERSATIONS, memoryConversations);

  // Log Activity
  await logActivity({
    entityType: "contact",
    entityId: contact.id,
    type: "note_added",
    title: "Conversation Linked",
    description: `Linked ${conv.channel.toUpperCase()} conversation (${conv.participant.handleOrIdentifier}) to contact profile.`,
    author: conv.assignedOwner || "Sales Executive",
    timestamp: new Date().toISOString(),
  });

  return updatedConv;
}
