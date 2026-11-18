export type Channel =
  | "whatsapp"
  | "instagram"
  | "messenger"
  | "email"
  | "website";

export type ConversationStatus = "open" | "pending" | "resolved" | "archived";

export type ConversationPriority = "low" | "medium" | "high" | "urgent";

export type SenderType = "customer" | "executive" | "system";

export type DeliveryStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export type Participant = {
  id: string;
  name: string;
  handleOrIdentifier: string; // Phone (+91...), IG Handle (@aarav...), Email, etc.
  avatar?: string;
  channel: Channel;
};

export type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  isDemoPrototype?: boolean;
};

export type Message = {
  id: string;
  conversationId: string;
  channel: Channel;
  senderType: SenderType;
  senderName: string;
  content: string;
  timestamp: string; // ISO 8601 or formatted
  isInternalNote?: boolean; // Critical: Internal team notes must NEVER be transmitted to external customers
  deliveryStatus?: DeliveryStatus;
  attachments?: Attachment[];
  replyToReferenceId?: string;
  isSimulatedDemo?: boolean; // Clearly indicates local simulation
};

export type Conversation = {
  id: string;
  channel: Channel;
  status: ConversationStatus;
  priority: ConversationPriority;
  participant: Participant;
  contactId?: string;
  leadId?: string;
  companyId?: string;
  dealId?: string;
  assignedOwner: string;
  unreadCount: number;
  lastMessage: Message;
  tags: string[];
  channelAccountId?: string;
  draftMessage?: string; // Per-conversation draft preservation
  createdAt: string;
  updatedAt: string;
};

export type ChannelConnectionStatus =
  | "not_connected"
  | "connecting"
  | "connected"
  | "error"
  | "demo_mode";

export type ChannelConnection = {
  id: string;
  channel: Channel;
  name: string;
  accountIdentifier: string;
  status: ChannelConnectionStatus;
  capabilities: string[];
  lastSyncAt?: string;
  errorMessage?: string;
  isDemo: boolean;
  setupGuide?: string;
  docsUrl?: string;
};

export type TemplateCategory =
  | "First response"
  | "Lead qualification"
  | "Pricing inquiry"
  | "Appointment scheduling"
  | "Proposal follow-up"
  | "Customer support"
  | "General replies";

export type MessageTemplate = {
  id: string;
  title: string;
  category: TemplateCategory;
  content: string;
  isFavorite: boolean;
  channel?: Channel | "all";
};

export type InternalNote = {
  id: string;
  conversationId: string;
  author: string;
  content: string;
  timestamp: string;
};

export type ConversationAssignment = {
  conversationId: string;
  previousOwner?: string;
  newOwner: string;
  assignedAt: string;
};

export type MessageDeliveryEvent = {
  id: string;
  messageId: string;
  status: DeliveryStatus;
  timestamp: string;
  providerNote?: string;
};

export interface CommunicationAdapter {
  channel: Channel;
  name: string;
  getConnection(): Promise<ChannelConnection>;
  fetchConversations(): Promise<Conversation[]>;
  fetchMessages(conversationId: string): Promise<Message[]>;
  sendMessage(
    conversationId: string,
    content: string,
    attachments?: Attachment[]
  ): Promise<Message>;
  sendInternalNote(
    conversationId: string,
    content: string,
    author: string
  ): Promise<Message>;
  updateStatus(conversationId: string, status: ConversationStatus): Promise<void>;
  assign(conversationId: string, owner: string): Promise<void>;
}
