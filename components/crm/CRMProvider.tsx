"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  Lead,
  Contact,
  Company,
  Deal,
  PipelineStage,
  CRMActivity,
  CRMNote,
  CRMFile,
  CRMTask,
  CRMMeeting,
  MeetingOutcome,
  CRMReminder,
  SmartRecommendation,
  DEFAULT_PIPELINE_STAGES,
  Conversation,
  Message,
  MessageTemplate,
  ChannelConnection,
  ConversationStatus,
  ConversationPriority,
  Attachment,
  MarketingCampaign,
  CampaignDailyMetric,
  AdCreative,
  CampaignTouchpoint,
  MarketingImport,
  ReportDefinition,
  Workflow,
  WorkflowExecution,
  ActionExecution,
  AutomationEvent,
  WorkflowStatus,
} from "./types";
import * as repo from "./repository";
import * as mktRepo from "../marketing/MarketingRepository";
import { AutomationRepository } from "../automations/AutomationRepository";
import { WorkflowEngine } from "../automations/WorkflowEngine";

type CRMContextType = {
  leads: Lead[];
  contacts: Contact[];
  companies: Company[];
  deals: Deal[];
  stages: PipelineStage[];
  loading: boolean;
  selectedDeal: Lead | null;

  // Phase 07 — Campaign Intelligence & Analytics
  campaigns: MarketingCampaign[];
  dailyMetrics: CampaignDailyMetric[];
  creatives: AdCreative[];
  touchpoints: CampaignTouchpoint[];
  reports: ReportDefinition[];
  createCampaign: (data: Omit<MarketingCampaign, "id" | "createdAt" | "updatedAt">) => Promise<MarketingCampaign>;
  updateCampaign: (id: string, updates: Partial<MarketingCampaign>) => Promise<MarketingCampaign>;
  archiveCampaign: (id: string) => Promise<MarketingCampaign>;
  deleteCampaign: (id: string) => Promise<void>;
  importDailyMetrics: (metrics: CampaignDailyMetric[]) => Promise<MarketingImport>;
  createCreative: (creative: Omit<AdCreative, "id">) => Promise<AdCreative>;
  recordTouchpoint: (tp: Omit<CampaignTouchpoint, "id" | "timestamp">) => Promise<CampaignTouchpoint>;
  saveReport: (report: Omit<ReportDefinition, "id" | "createdAt">) => Promise<ReportDefinition>;
  isCampaignDrawerOpen: boolean;
  campaignDrawerCampaignId: string | null;
  openCampaignDrawer: (campaignId?: string) => void;
  closeCampaignDrawer: () => void;

  // Phase 08 — Automation Studio
  workflows: Workflow[];
  executions: WorkflowExecution[];
  createWorkflow: (data: Omit<Workflow, "id" | "createdAt" | "updatedAt">) => Promise<Workflow>;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => Promise<Workflow>;
  deleteWorkflow: (id: string) => Promise<void>;
  duplicateWorkflow: (id: string) => Promise<Workflow>;
  toggleWorkflowStatus: (id: string) => Promise<Workflow>;
  emergencyPauseAllWorkflows: () => Promise<void>;
  dispatchAutomationEvent: (event: Omit<AutomationEvent, "id" | "timestamp">) => Promise<WorkflowExecution[]>;

  // Phase 06 — Productivity, Tasks & Calendar
  tasks: CRMTask[];
  meetings: CRMMeeting[];
  reminders: CRMReminder[];
  recommendations: SmartRecommendation[];
  unreadRemindersCount: number;

  createTask: (
    task: Partial<CRMTask> & { title: string }
  ) => Promise<CRMTask>;
  updateTask: (id: string, updates: Partial<CRMTask>) => Promise<CRMTask>;
  toggleTask: (id: string) => Promise<CRMTask>;
  rescheduleTask: (id: string, newDueDate: string, newDueTime?: string) => Promise<CRMTask>;
  deleteTask: (id: string) => Promise<void>;
  getTasksFor: (
    entityType?: string,
    entityId?: string
  ) => Promise<CRMTask[]>;
  generateRecurringOccurrences: (taskId: string, count?: number) => Promise<CRMTask[]>;

  createMeeting: (
    data: Partial<CRMMeeting> & { title: string; date: string; startTime: string; endTime: string }
  ) => Promise<CRMMeeting>;
  updateMeeting: (id: string, updates: Partial<CRMMeeting>) => Promise<CRMMeeting>;
  completeMeeting: (id: string, outcome: MeetingOutcome, nextSteps?: string[]) => Promise<CRMMeeting>;
  cancelMeeting: (id: string, reason?: string) => Promise<CRMMeeting>;
  deleteMeeting: (id: string) => Promise<void>;

  markReminderRead: (id: string) => Promise<void>;
  markAllRemindersRead: () => Promise<void>;
  dismissReminder: (id: string) => Promise<void>;
  snoozeReminder: (id: string, minutes?: number) => Promise<void>;

  dismissRecommendation: (id: string) => Promise<void>;
  snoozeRecommendation: (id: string, days?: number) => Promise<void>;

  // Contextual Drawers
  isTaskDrawerOpen: boolean;
  taskDrawerTaskId: string | null;
  taskDrawerPrefill: Partial<CRMTask> | null;
  openTaskDrawer: (taskId?: string, prefill?: Partial<CRMTask>) => void;
  closeTaskDrawer: () => void;

  isMeetingDrawerOpen: boolean;
  meetingDrawerMeetingId: string | null;
  meetingDrawerPrefill: Partial<CRMMeeting> | null;
  openMeetingDrawer: (meetingId?: string, prefill?: Partial<CRMMeeting>) => void;
  closeMeetingDrawer: () => void;

  // Leads
  createLead: (data: Omit<Lead, "id" | "createdAt">) => Promise<Lead>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<Lead>;
  moveLead: (id: string, stageId: string) => Promise<Lead>;
  convertLead: (params: repo.ConvertLeadParams) => Promise<{
    contact?: Contact;
    company?: Company;
    deal?: Deal;
    lead: Lead;
  }>;

  // Contacts
  createContact: (
    data: Omit<Contact, "id" | "createdAt" | "updatedAt">
  ) => Promise<Contact>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;

  // Companies
  createCompany: (
    data: Omit<Company, "id" | "createdAt" | "updatedAt">
  ) => Promise<Company>;
  updateCompany: (id: string, updates: Partial<Company>) => Promise<Company>;
  deleteCompany: (id: string) => Promise<void>;

  // Deals
  createDeal: (
    data: Omit<Deal, "id" | "createdAt" | "updatedAt">
  ) => Promise<Deal>;
  updateDeal: (id: string, updates: Partial<Deal>) => Promise<Deal>;

  // Stages
  updateStages: (stages: PipelineStage[]) => Promise<PipelineStage[]>;

  // Activities, Notes, Files, Tasks
  logActivity: (
    activity: Omit<CRMActivity, "id" | "timestamp"> & { timestamp?: string }
  ) => Promise<CRMActivity>;
  getActivitiesFor: (
    entityType: "contact" | "company" | "lead" | "deal",
    entityId: string
  ) => Promise<CRMActivity[]>;

  createNote: (
    note: Omit<CRMNote, "id" | "createdAt">
  ) => Promise<CRMNote>;
  deleteNote: (id: string) => Promise<void>;
  getNotesFor: (
    entityType: "contact" | "company" | "lead" | "deal",
    entityId: string
  ) => Promise<CRMNote[]>;

  addFile: (
    file: Omit<CRMFile, "id" | "uploadedAt">
  ) => Promise<CRMFile>;
  deleteFile: (id: string) => Promise<void>;
  getFilesFor: (
    entityType: "contact" | "company" | "lead" | "deal",
    entityId: string
  ) => Promise<CRMFile[]>;

  // Drawer & Utility
  openDealDrawer: (id: string) => void;
  closeDealDrawer: () => void;
  refreshAll: () => Promise<void>;
  resetCRMData: () => Promise<void>;

  // Unified Inbox & Communications
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  templates: MessageTemplate[];
  channelConnections: ChannelConnection[];
  setActiveConversationId: (id: string | null) => void;
  getMessagesForConversation: (id: string) => Promise<Message[]>;
  sendConversationMessage: (params: {
    conversationId: string;
    content: string;
    senderName?: string;
    attachments?: Attachment[];
    isInternalNote?: boolean;
    replyToReferenceId?: string;
  }) => Promise<Message>;
  updateConversationStatus: (
    id: string,
    status: ConversationStatus
  ) => Promise<Conversation>;
  updateConversationPriority: (
    id: string,
    priority: ConversationPriority
  ) => Promise<Conversation>;
  assignConversation: (id: string, owner: string) => Promise<Conversation>;
  markConversationRead: (id: string) => Promise<Conversation>;
  saveConversationDraft: (id: string, draft: string) => Promise<Conversation>;
  createMessageTemplate: (
    template: Omit<MessageTemplate, "id">
  ) => Promise<MessageTemplate>;
  updateMessageTemplate: (
    id: string,
    updates: Partial<MessageTemplate>
  ) => Promise<MessageTemplate>;
  deleteMessageTemplate: (id: string) => Promise<void>;
  createLeadFromConversation: (
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
  ) => Promise<{ lead: Lead; conversation: Conversation }>;
  associateConversationWithContact: (
    conversationId: string,
    contactId: string,
    companyId?: string
  ) => Promise<Conversation>;
};

const CRMContext = createContext<CRMContextType | null>(null);

export function CRMProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>(DEFAULT_PIPELINE_STAGES);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [channelConnections, setChannelConnections] = useState<ChannelConnection[]>([]);
  
  // Phase 06 — Productivity State
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [meetings, setMeetings] = useState<CRMMeeting[]>([]);
  const [reminders, setReminders] = useState<CRMReminder[]>([]);
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);

  // Phase 07 — Campaign Intelligence & Marketing State
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [dailyMetrics, setDailyMetrics] = useState<CampaignDailyMetric[]>([]);
  const [creatives, setCreatives] = useState<AdCreative[]>([]);
  const [touchpoints, setTouchpoints] = useState<CampaignTouchpoint[]>([]);
  const [reports, setReports] = useState<ReportDefinition[]>([]);
  const [isCampaignDrawerOpen, setIsCampaignDrawerOpen] = useState(false);
  const [campaignDrawerCampaignId, setCampaignDrawerCampaignId] = useState<string | null>(null);

  // Phase 08 — Automation State
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);

  // Drawer Management
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [taskDrawerTaskId, setTaskDrawerTaskId] = useState<string | null>(null);
  const [taskDrawerPrefill, setTaskDrawerPrefill] = useState<Partial<CRMTask> | null>(null);

  const [isMeetingDrawerOpen, setIsMeetingDrawerOpen] = useState(false);
  const [meetingDrawerMeetingId, setMeetingDrawerMeetingId] = useState<string | null>(null);
  const [meetingDrawerPrefill, setMeetingDrawerPrefill] = useState<Partial<CRMMeeting> | null>(null);

  const [loading, setLoading] = useState(true);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [
        leadsRes,
        contactsRes,
        companiesRes,
        dealsRes,
        stagesRes,
        convsRes,
        templatesRes,
        channelsRes,
        tasksRes,
        meetingsRes,
        remindersRes,
        recsRes,
        campaignsRes,
        metricsRes,
        creativesRes,
        touchpointsRes,
        reportsRes,
      ] = await Promise.all([
        repo.listLeads(),
        repo.listContacts(),
        repo.listCompanies(),
        repo.listDeals(),
        repo.listStages(),
        repo.listConversations(),
        repo.listTemplates(),
        repo.listChannelConnections(),
        repo.listTasks(),
        repo.listMeetings(),
        repo.listReminders(),
        repo.getSmartFollowUpRecommendations(),
        mktRepo.listCampaigns(),
        mktRepo.listDailyMetrics(),
        mktRepo.listCreatives(),
        mktRepo.listTouchpoints(),
        mktRepo.listReports(),
      ]);
      setLeads(leadsRes);
      setContacts(contactsRes);
      setCompanies(companiesRes);
      setDeals(dealsRes);
      setStages(stagesRes);
      setConversations(convsRes);
      setTemplates(templatesRes);
      setChannelConnections(channelsRes);
      setTasks(tasksRes);
      setMeetings(meetingsRes);
      setReminders(remindersRes);
      setRecommendations(recsRes);
      setCampaigns(campaignsRes);
      setDailyMetrics(metricsRes);
      setCreatives(creativesRes);
      setTouchpoints(touchpointsRes);
      setReports(reportsRes);

      // Phase 08 — Load Workflows & Executions
      const storedWorkflows = AutomationRepository.getWorkflows();
      const storedExecutions = AutomationRepository.getExecutions();
      setWorkflows(storedWorkflows);
      setExecutions(storedExecutions);

      setActiveConversationId((prev) => {
        if (prev && convsRes.some((c) => c.id === prev)) return prev;
        return convsRes[0]?.id || null;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Leads
  const createLead = async (data: Omit<Lead, "id" | "createdAt">) => {
    const created = await repo.createLead(data);
    await loadData();
    setTimeout(() => {
      dispatchAutomationEvent({
        eventType: "lead_created",
        entityId: created.id,
        entityType: "lead",
        payload: created,
      });
    }, 0);
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

  const convertLead = async (params: repo.ConvertLeadParams) => {
    const result = await repo.convertLead(params);
    await loadData();
    setTimeout(() => {
      dispatchAutomationEvent({
        eventType: "lead_converted",
        entityId: result.lead.id,
        entityType: "lead",
        payload: result,
      });
    }, 0);
    return result;
  };

  // Contacts
  const createContact = async (
    data: Omit<Contact, "id" | "createdAt" | "updatedAt">
  ) => {
    const created = await repo.createContact(data);
    await loadData();
    return created;
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    const updated = await repo.updateContact(id, updates);
    await loadData();
    return updated;
  };

  const deleteContact = async (id: string) => {
    await repo.deleteContact(id);
    await loadData();
  };

  // Companies
  const createCompany = async (
    data: Omit<Company, "id" | "createdAt" | "updatedAt">
  ) => {
    const created = await repo.createCompany(data);
    await loadData();
    return created;
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    const updated = await repo.updateCompany(id, updates);
    await loadData();
    return updated;
  };

  const deleteCompany = async (id: string) => {
    await repo.deleteCompany(id);
    await loadData();
  };

  // Deals
  const createDeal = async (
    data: Omit<Deal, "id" | "createdAt" | "updatedAt">
  ) => {
    const created = await repo.createDeal(data);
    await loadData();
    setTimeout(() => {
      dispatchAutomationEvent({
        eventType: "deal_created",
        entityId: created.id,
        entityType: "deal",
        payload: created,
      });
    }, 0);
    return created;
  };

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    const updated = await repo.updateDeal(id, updates);
    await loadData();
    if (updates.stage) {
      setTimeout(() => {
        dispatchAutomationEvent({
          eventType: "deal_stage_changed",
          entityId: updated.id,
          entityType: "deal",
          payload: updated,
        });
        if (updates.stage === "won") {
          dispatchAutomationEvent({
            eventType: "deal_won",
            entityId: updated.id,
            entityType: "deal",
            payload: updated,
          });
        } else if (updates.stage === "lost") {
          dispatchAutomationEvent({
            eventType: "deal_lost",
            entityId: updated.id,
            entityType: "deal",
            payload: updated,
          });
        }
      }, 0);
    }
    return updated;
  };

  // Stages
  const updateStages = async (newStages: PipelineStage[]) => {
    const updated = await repo.updateStages(newStages);
    setStages(updated);
    return updated;
  };

  // Activities
  const logActivity = async (
    activity: Omit<CRMActivity, "id" | "timestamp"> & { timestamp?: string }
  ) => {
    const logged = await repo.logActivity(activity);
    return logged;
  };

  const getActivitiesFor = async (
    entityType: "contact" | "company" | "lead" | "deal",
    entityId: string
  ) => {
    return repo.listActivities(entityType, entityId);
  };

  // Notes
  const createNote = async (note: Omit<CRMNote, "id" | "createdAt">) => {
    const created = await repo.createNote(note);
    return created;
  };

  const deleteNote = async (id: string) => {
    await repo.deleteNote(id);
  };

  const getNotesFor = async (
    entityType: "contact" | "company" | "lead" | "deal",
    entityId: string
  ) => {
    return repo.listNotes(entityType, entityId);
  };

  // Files
  const addFile = async (file: Omit<CRMFile, "id" | "uploadedAt">) => {
    const created = await repo.addFile(file);
    return created;
  };

  const deleteFile = async (id: string) => {
    await repo.deleteFile(id);
  };

  const getFilesFor = async (
    entityType: "contact" | "company" | "lead" | "deal",
    entityId: string
  ) => {
    return repo.listFiles(entityType, entityId);
  };

  // Phase 06 — Tasks & Productivity Methods
  const createTask = async (task: Partial<CRMTask> & { title: string }) => {
    const created = await repo.createTask(task);
    await loadData();
    return created;
  };

  const updateTask = async (id: string, updates: Partial<CRMTask>) => {
    const updated = await repo.updateTask(id, updates);
    await loadData();
    return updated;
  };

  const toggleTask = async (id: string) => {
    const toggled = await repo.toggleTask(id);
    await loadData();
    return toggled;
  };

  const rescheduleTask = async (id: string, newDueDate: string, newDueTime?: string) => {
    const updated = await repo.rescheduleTask(id, newDueDate, newDueTime);
    await loadData();
    return updated;
  };

  const deleteTask = async (id: string) => {
    await repo.deleteTask(id);
    await loadData();
  };

  const getTasksFor = async (
    entityType?: string,
    entityId?: string
  ) => {
    return repo.getTasksFor(entityType, entityId);
  };

  const generateRecurringOccurrences = async (taskId: string, count?: number) => {
    const res = await repo.generateRecurringOccurrences(taskId, count);
    await loadData();
    return res;
  };

  // Meetings
  const createMeeting = async (
    data: Partial<CRMMeeting> & { title: string; date: string; startTime: string; endTime: string }
  ) => {
    const created = await repo.createMeeting(data);
    await loadData();
    return created;
  };

  const updateMeeting = async (id: string, updates: Partial<CRMMeeting>) => {
    const updated = await repo.updateMeeting(id, updates);
    await loadData();
    return updated;
  };

  const completeMeeting = async (id: string, outcome: MeetingOutcome, nextSteps?: string[]) => {
    const updated = await repo.completeMeeting(id, outcome, nextSteps);
    await loadData();
    return updated;
  };

  const cancelMeeting = async (id: string, reason?: string) => {
    const updated = await repo.cancelMeeting(id, reason);
    await loadData();
    return updated;
  };

  const deleteMeeting = async (id: string) => {
    await repo.deleteMeeting(id);
    await loadData();
  };

  // Reminders & Local Notifications
  const markReminderRead = async (id: string) => {
    await repo.markReminderRead(id);
    await loadData();
  };

  const markAllRemindersRead = async () => {
    await repo.markAllRemindersRead();
    await loadData();
  };

  const dismissReminder = async (id: string) => {
    await repo.dismissReminder(id);
    await loadData();
  };

  const snoozeReminder = async (id: string, minutes?: number) => {
    await repo.snoozeReminder(id, minutes);
    await loadData();
  };

  // Smart Follow-up Engine
  const dismissRecommendation = async (id: string) => {
    await repo.dismissRecommendation(id);
    await loadData();
  };

  const snoozeRecommendation = async (id: string, days?: number) => {
    await repo.snoozeRecommendation(id, days);
    await loadData();
  };

  // Contextual Drawers
  const openTaskDrawer = (taskId?: string, prefill?: Partial<CRMTask>) => {
    setTaskDrawerTaskId(taskId || null);
    setTaskDrawerPrefill(prefill || null);
    setIsTaskDrawerOpen(true);
  };

  const closeTaskDrawer = () => {
    setIsTaskDrawerOpen(false);
    setTaskDrawerTaskId(null);
    setTaskDrawerPrefill(null);
  };

  const openMeetingDrawer = (meetingId?: string, prefill?: Partial<CRMMeeting>) => {
    setMeetingDrawerMeetingId(meetingId || null);
    setMeetingDrawerPrefill(prefill || null);
    setIsMeetingDrawerOpen(true);
  };

  const closeMeetingDrawer = () => {
    setIsMeetingDrawerOpen(false);
    setMeetingDrawerMeetingId(null);
    setMeetingDrawerPrefill(null);
  };

  // Phase 07 — Campaign Intelligence Actions
  const createCampaign = async (
    data: Omit<MarketingCampaign, "id" | "createdAt" | "updatedAt">
  ) => {
    const res = await mktRepo.createCampaign(data);
    await loadData();
    return res;
  };

  const updateCampaign = async (
    id: string,
    updates: Partial<MarketingCampaign>
  ) => {
    const res = await mktRepo.updateCampaign(id, updates);
    await loadData();
    return res;
  };

  const archiveCampaign = async (id: string) => {
    const res = await mktRepo.archiveCampaign(id);
    await loadData();
    return res;
  };

  const deleteCampaign = async (id: string) => {
    await mktRepo.deleteCampaign(id);
    await loadData();
  };

  const importDailyMetrics = async (metrics: CampaignDailyMetric[]) => {
    const res = await mktRepo.importDailyMetrics(metrics);
    await loadData();
    return res;
  };

  const createCreative = async (creative: Omit<AdCreative, "id">) => {
    const res = await mktRepo.createCreative(creative);
    await loadData();
    return res;
  };

  const recordTouchpoint = async (
    tp: Omit<CampaignTouchpoint, "id" | "timestamp">
  ) => {
    const res = await mktRepo.recordTouchpoint(tp);
    await loadData();
    return res;
  };

  const saveReport = async (
    report: Omit<ReportDefinition, "id" | "createdAt">
  ) => {
    const res = await mktRepo.saveReport(report);
    await loadData();
    return res;
  };

  const openCampaignDrawer = (campaignId?: string) => {
    setCampaignDrawerCampaignId(campaignId || null);
    setIsCampaignDrawerOpen(true);
  };

  const closeCampaignDrawer = () => {
    setIsCampaignDrawerOpen(false);
    setCampaignDrawerCampaignId(null);
  };

  const unreadRemindersCount = reminders.filter(
    (r) => !r.isRead && !r.isDismissed
  ).length;

  // Drawer & Reset
  const openDealDrawer = (id: string) => {
    setSelectedDealId(id);
  };

  const closeDealDrawer = () => {
    setSelectedDealId(null);
  };

  const resetCRMData = async () => {
    await repo.resetCRMData();
    await loadData();
  };

  // Communications & Unified Inbox
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ||
    conversations[0] ||
    null;

  const getMessagesForConversation = async (id: string) => {
    return repo.listMessages(id);
  };

  const sendConversationMessage = async (params: {
    conversationId: string;
    content: string;
    senderName?: string;
    attachments?: Attachment[];
    isInternalNote?: boolean;
    replyToReferenceId?: string;
  }) => {
    const msg = await repo.sendMessage(params);
    await loadData();
    return msg;
  };

  const updateConversationStatus = async (
    id: string,
    status: ConversationStatus
  ) => {
    const updated = await repo.updateConversationStatus(id, status);
    await loadData();
    return updated;
  };

  const updateConversationPriority = async (
    id: string,
    priority: ConversationPriority
  ) => {
    const updated = await repo.updateConversationPriority(id, priority);
    await loadData();
    return updated;
  };

  const assignConversation = async (id: string, owner: string) => {
    const updated = await repo.assignConversation(id, owner);
    await loadData();
    return updated;
  };

  const markConversationRead = async (id: string) => {
    const updated = await repo.markConversationRead(id);
    await loadData();
    return updated;
  };

  const saveConversationDraft = async (id: string, draft: string) => {
    const updated = await repo.saveConversationDraft(id, draft);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, draftMessage: draft } : c))
    );
    return updated;
  };

  const createMessageTemplate = async (
    template: Omit<MessageTemplate, "id">
  ) => {
    const created = await repo.createTemplate(template);
    await loadData();
    return created;
  };

  const updateMessageTemplate = async (
    id: string,
    updates: Partial<MessageTemplate>
  ) => {
    const updated = await repo.updateTemplate(id, updates);
    await loadData();
    return updated;
  };

  const deleteMessageTemplate = async (id: string) => {
    await repo.deleteTemplate(id);
    await loadData();
  };

  const createLeadFromConversation = async (
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
  ) => {
    const res = await repo.createLeadFromConversation(conversationId, leadData);
    await loadData();
    return res;
  };

  const associateConversationWithContact = async (
    conversationId: string,
    contactId: string,
    companyId?: string
  ) => {
    const res = await repo.associateConversationWithContact(
      conversationId,
      contactId,
      companyId
    );
    await loadData();
    return res;
  };

  // -------------------------------------------------------------------------
  // Phase 08 — Automation Studio Methods
  // -------------------------------------------------------------------------

  const createWorkflow = async (
    data: Omit<Workflow, "id" | "createdAt" | "updatedAt">
  ): Promise<Workflow> => {
    const newWorkflow: Workflow = {
      ...data,
      id: `wf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const next = [newWorkflow, ...workflows];
    setWorkflows(next);
    AutomationRepository.saveWorkflows(next);
    return newWorkflow;
  };

  const updateWorkflow = async (
    id: string,
    updates: Partial<Workflow>
  ): Promise<Workflow> => {
    let updated: Workflow | null = null;
    const next = workflows.map((w) => {
      if (w.id === id) {
        updated = {
          ...w,
          ...updates,
          version: updates.nodes || updates.edges ? w.version + 1 : w.version,
          updatedAt: new Date().toISOString(),
        };
        return updated;
      }
      return w;
    });

    if (!updated) throw new Error(`Workflow with id '${id}' not found`);
    setWorkflows(next);
    AutomationRepository.saveWorkflows(next);
    return updated;
  };

  const deleteWorkflow = async (id: string): Promise<void> => {
    const next = workflows.filter((w) => w.id !== id);
    setWorkflows(next);
    AutomationRepository.saveWorkflows(next);
  };

  const duplicateWorkflow = async (id: string): Promise<Workflow> => {
    const source = workflows.find((w) => w.id === id);
    if (!source) throw new Error(`Workflow with id '${id}' not found`);

    const cloned: Workflow = {
      ...source,
      id: `wf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: `${source.name} (Copy)`,
      status: "draft",
      isTemplate: false,
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      lastExecutedAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const next = [cloned, ...workflows];
    setWorkflows(next);
    AutomationRepository.saveWorkflows(next);
    return cloned;
  };

  const toggleWorkflowStatus = async (id: string): Promise<Workflow> => {
    const source = workflows.find((w) => w.id === id);
    if (!source) throw new Error(`Workflow with id '${id}' not found`);

    const nextStatus: WorkflowStatus = source.status === "active" ? "inactive" : "active";
    return updateWorkflow(id, { status: nextStatus });
  };

  const emergencyPauseAllWorkflows = async (): Promise<void> => {
    const next = workflows.map((w) => ({
      ...w,
      status: (w.status === "active" ? "inactive" : w.status) as WorkflowStatus,
      updatedAt: new Date().toISOString(),
    }));
    setWorkflows(next);
    AutomationRepository.saveWorkflows(next);
  };

  const dispatchAutomationEvent = async (
    eventInput: Omit<AutomationEvent, "id" | "timestamp">
  ): Promise<WorkflowExecution[]> => {
    const event: AutomationEvent = {
      ...eventInput,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };

    const activeWfs = workflows.filter(
      (w) => w.status === "active" && w.triggerType === event.eventType
    );

    if (activeWfs.length === 0) return [];

    const newExecutions: WorkflowExecution[] = [];

    for (const wf of activeWfs) {
      const sim = WorkflowEngine.dryRun(wf, event);
      if (!sim.matchedTrigger) continue;

      const startedAt = new Date().toISOString();
      const actionSteps: ActionExecution[] = [];

      for (const act of sim.proposedActions) {
        try {
          if (act.actionType === "assign_lead_owner" && act.parameters.owner) {
            await repo.updateLead(event.entityId, { owner: act.parameters.owner });
          } else if (act.actionType === "update_lead_priority" && act.parameters.priority) {
            await repo.updateLead(event.entityId, { priority: act.parameters.priority });
          } else if (act.actionType === "add_lead_tag" && act.parameters.tag) {
            const currentLead = leads.find((l) => l.id === event.entityId);
            const notes = currentLead?.notes || "";
            await repo.updateLead(event.entityId, {
              notes: notes.includes(`#${act.parameters.tag}`)
                ? notes
                : `${notes} #${act.parameters.tag}`.trim(),
            });
          } else if (act.actionType === "create_task") {
            const dueDays = act.parameters.dueDays || 1;
            const dueDate = new Date(Date.now() + dueDays * 86400000).toISOString().split("T")[0];
            await repo.createTask({
              title: act.parameters.title || "Automated Task",
              priority: act.parameters.priority || "high",
              dueDate,
              taskType: act.parameters.taskType || "follow_up",
              assignedTo: "Rahul Sharma",
              entityType: event.entityType as any,
              entityId: event.entityId,
              entityName: event.payload.name || event.payload.company || "Automation Record",
            });
          } else if (act.actionType === "update_deal_stage" && act.parameters.stage) {
            await repo.updateDeal(event.entityId, { stage: act.parameters.stage });
          } else if (act.actionType === "create_reminder") {
            await repo.createReminder({
              title: act.parameters.message || "Automation Alert",
              message: act.parameters.message || "Automation Alert",
              dueAt: new Date().toISOString(),
              priority: (act.parameters.priority as any) || "high",
              entityType: "follow_up",
              entityId: event.entityId,
            });
          } else if (act.actionType === "add_internal_note" && act.parameters.note) {
            const noteEntityType = ["lead", "contact", "company", "deal"].includes(event.entityType)
              ? (event.entityType as "lead" | "contact" | "company" | "deal")
              : "lead";
            await repo.createNote({
              entityType: noteEntityType,
              entityId: event.entityId,
              content: act.parameters.note,
              author: "Automation Engine",
            });
          }

          actionSteps.push({
            nodeId: act.nodeId,
            nodeType: "action",
            nodeTitle: act.nodeTitle,
            status: "success",
            detail: act.description,
            timestamp: new Date().toISOString(),
          });
        } catch (err: any) {
          actionSteps.push({
            nodeId: act.nodeId,
            nodeType: "action",
            nodeTitle: act.nodeTitle,
            status: "failed",
            detail: `Failed: ${err.message || "Action execution error"}`,
            timestamp: new Date().toISOString(),
          });
        }
      }

      const executionRecord: WorkflowExecution = {
        id: `exec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        workflowId: wf.id,
        workflowName: wf.name,
        workflowVersion: wf.version,
        triggerEvent: event,
        status: actionSteps.some((s) => s.status === "failed") ? "failure" : "success",
        steps: actionSteps,
        startedAt,
        completedAt: new Date().toISOString(),
        proposedChanges: sim.proposedActions,
      };

      newExecutions.push(executionRecord);

      // Increment execution counters
      const updatedWfs = workflows.map((w) =>
        w.id === wf.id
          ? {
              ...w,
              executionCount: (w.executionCount || 0) + 1,
              successCount:
                executionRecord.status === "success"
                  ? (w.successCount || 0) + 1
                  : w.successCount || 0,
              failureCount:
                executionRecord.status === "failure"
                  ? (w.failureCount || 0) + 1
                  : w.failureCount || 0,
              lastExecutedAt: executionRecord.completedAt,
            }
          : w
      );
      setWorkflows(updatedWfs);
      AutomationRepository.saveWorkflows(updatedWfs);
    }

    if (newExecutions.length > 0) {
      setExecutions((prev) => {
        const next = [...newExecutions, ...prev].slice(0, 100);
        AutomationRepository.saveExecutions(next);
        return next;
      });
      await loadData();
    }

    return newExecutions;
  };

  const selectedDeal = leads.find((l) => l.id === selectedDealId) || null;

  return (
    <CRMContext.Provider
      value={{
        leads,
        contacts,
        companies,
        deals,
        stages,
        loading,
        selectedDeal,
        createLead,
        updateLead,
        moveLead,
        convertLead,
        createContact,
        updateContact,
        deleteContact,
        createCompany,
        updateCompany,
        deleteCompany,
        createDeal,
        updateDeal,
        updateStages,
        logActivity,
        getActivitiesFor,
        createNote,
        deleteNote,
        getNotesFor,
        addFile,
        deleteFile,
        getFilesFor,

        // Phase 06 — Productivity, Tasks, Calendar, Meetings, Reminders
        tasks,
        meetings,
        reminders,
        recommendations,
        unreadRemindersCount,
        createTask,
        updateTask,
        toggleTask,
        rescheduleTask,
        deleteTask,
        getTasksFor,
        generateRecurringOccurrences,
        createMeeting,
        updateMeeting,
        completeMeeting,
        cancelMeeting,
        deleteMeeting,
        markReminderRead,
        markAllRemindersRead,
        dismissReminder,
        snoozeReminder,
        dismissRecommendation,
        snoozeRecommendation,
        isTaskDrawerOpen,
        taskDrawerTaskId,
        taskDrawerPrefill,
        openTaskDrawer,
        closeTaskDrawer,
        isMeetingDrawerOpen,
        meetingDrawerMeetingId,
        meetingDrawerPrefill,
        openMeetingDrawer,
        closeMeetingDrawer,

        // Phase 07 — Campaign Intelligence & Analytics
        campaigns,
        dailyMetrics,
        creatives,
        touchpoints,
        reports,
        createCampaign,
        updateCampaign,
        archiveCampaign,
        deleteCampaign,
        importDailyMetrics,
        createCreative,
        recordTouchpoint,
        saveReport,
        isCampaignDrawerOpen,
        campaignDrawerCampaignId,
        openCampaignDrawer,
        closeCampaignDrawer,

        // Phase 08 — Automation Studio
        workflows,
        executions,
        createWorkflow,
        updateWorkflow,
        deleteWorkflow,
        duplicateWorkflow,
        toggleWorkflowStatus,
        emergencyPauseAllWorkflows,
        dispatchAutomationEvent,

        openDealDrawer,
        closeDealDrawer,
        refreshAll: loadData,
        resetCRMData,
        conversations,
        activeConversationId,
        activeConversation,
        templates,
        channelConnections,
        setActiveConversationId,
        getMessagesForConversation,
        sendConversationMessage,
        updateConversationStatus,
        updateConversationPriority,
        assignConversation,
        markConversationRead,
        saveConversationDraft,
        createMessageTemplate,
        updateMessageTemplate,
        deleteMessageTemplate,
        createLeadFromConversation,
        associateConversationWithContact,
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
