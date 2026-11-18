import {
  Channel,
  ChannelConnection,
  Conversation,
  Message,
  Attachment,
  ConversationStatus,
} from "../types";

export interface ChannelAdapter {
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
  updateStatus(
    conversationId: string,
    status: ConversationStatus
  ): Promise<void>;
  assign(conversationId: string, owner: string): Promise<void>;
  disconnect(): Promise<void>;
}
