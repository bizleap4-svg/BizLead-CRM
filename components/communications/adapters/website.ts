import { ChannelAdapter } from "./types";
import { ChannelConnection, Message, Attachment } from "../types";

export class WebsiteChatAdapter implements ChannelAdapter {
  channel = "website" as const;
  name = "BizLead Embedded Live Chat Widget";

  async getConnection(): Promise<ChannelConnection> {
    return {
      id: "conn-wb-01",
      channel: "website",
      name: "BizLead Web Widget v2.1",
      accountIdentifier: "bizlead.io (Public Website)",
      status: "demo_mode",
      capabilities: [
        "Real-time WebSocket Chat",
        "Lead Capture Pre-chat Form",
        "Session URL & Page Tracking",
        "Agent Hand-off",
      ],
      lastSyncAt: new Date().toISOString(),
      isDemo: true,
      setupGuide:
        "Embed the BizLead chat script tag into your landing page or web app HTML footer.",
      docsUrl: "https://bizlead.io/docs/chat-widget",
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
      "Live website chat delivery requires an active WebSocket server. Local simulation runs via Demo Adapter."
    );
  }

  async sendInternalNote(
    _conversationId: string,
    _content: string,
    _author: string
  ): Promise<Message> {
    throw new Error("Internal notes are stored in local CRM, not transmitted to website visitors.");
  }

  async updateStatus() {}
  async assign() {}
  async disconnect() {}
}
