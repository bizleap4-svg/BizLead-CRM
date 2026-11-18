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
  DEFAULT_PIPELINE_STAGES,
  Conversation,
  Message,
  MessageTemplate,
  ChannelConnection,
  ConversationStatus,
  ConversationPriority,
  Attachment,
} from "./types";
import * as repo from "./repository";

type CRMContextType = {
  leads: Lead[];
  contacts: Contact[];
  companies: Company[];
  deals: Deal[];
  stages: PipelineStage[];
  loading: boolean;
  selectedDeal: Lead | null;

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

  createTask: (
    task: Omit<CRMTask, "id" | "createdAt">
  ) => Promise<CRMTask>;
  toggleTask: (id: string) => Promise<CRMTask>;
  deleteTask: (id: string) => Promise<void>;
  getTasksFor: (
    entityType: "contact" | "company" | "lead" | "deal",
    entityId: string
  ) => Promise<CRMTask[]>;

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
      ] = await Promise.all([
        repo.listLeads(),
        repo.listContacts(),
        repo.listCompanies(),
        repo.listDeals(),
        repo.listStages(),
        repo.listConversations(),
        repo.listTemplates(),
        repo.listChannelConnections(),
      ]);
      setLeads(leadsRes);
      setContacts(contactsRes);
      setCompanies(companiesRes);
      setDeals(dealsRes);
      setStages(stagesRes);
      setConversations(convsRes);
      setTemplates(templatesRes);
      setChannelConnections(channelsRes);

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
    return created;
  };

  const updateDeal = async (id: string, updates: Partial<Deal>) => {
    const updated = await repo.updateDeal(id, updates);
    await loadData();
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

  // Tasks
  const createTask = async (task: Omit<CRMTask, "id" | "createdAt">) => {
    const created = await repo.createTask(task);
    return created;
  };

  const toggleTask = async (id: string) => {
    const toggled = await repo.toggleTask(id);
    return toggled;
  };

  const deleteTask = async (id: string) => {
    await repo.deleteTask(id);
  };

  const getTasksFor = async (
    entityType: "contact" | "company" | "lead" | "deal",
    entityId: string
  ) => {
    return repo.listTasks(entityType, entityId);
  };

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
        createTask,
        toggleTask,
        deleteTask,
        getTasksFor,
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
