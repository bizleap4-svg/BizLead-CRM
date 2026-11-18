import { ChannelAdapter } from "./types";
import { ChannelConnection, Message, Attachment } from "../types";

export class WhatsAppAdapter implements ChannelAdapter {
  channel = "whatsapp" as const;
  name = "WhatsApp Business Platform (Cloud API)";

  async getConnection(): Promise<ChannelConnection> {
    return {
      id: "conn-wa-01",
      channel: "whatsapp",
      name: "WhatsApp Business Cloud API",
      accountIdentifier: "+91 98201 00000 (BizLead Official)",
      status: "demo_mode",
      capabilities: [
        "Inbound Messages",
        "Outbound Replies",
        "Document & Image Attachments",
        "Delivery & Read Receipts",
        "Meta Approved Templates",
      ],
      lastSyncAt: new Date().toISOString(),
      isDemo: true,
      setupGuide:
        "Requires Meta Business Manager verification, WhatsApp Business Account (WABA), Phone Number ID, and a secure server-side webhook endpoint. Never store Meta Access Tokens in the browser.",
      docsUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api",
    };
  }

  async fetchConversations() {
    return [];
  }

  async fetchMessages() {
    return [];
  }

  async sendMessage(
    _conversationId: string,
    _content: string,
    _attachments?: Attachment[]
  ): Promise<Message> {
    throw new Error(
      "WhatsApp Cloud API requires server-side webhook and access token. Local simulation is managed by the Demo Adapter."
    );
  }

  async sendInternalNote(
    _conversationId: string,
    _content: string,
    _author: string
  ): Promise<Message> {
    throw new Error("Internal notes are stored in local CRM, not transmitted to WhatsApp.");
  }

  async updateStatus() {}
  async assign() {}
  async disconnect() {}
}
