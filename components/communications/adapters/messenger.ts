import { ChannelAdapter } from "./types";
import { ChannelConnection, Message, Attachment } from "../types";

export class MessengerAdapter implements ChannelAdapter {
  channel = "messenger" as const;
  name = "Meta Messenger Platform";

  async getConnection(): Promise<ChannelConnection> {
    return {
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
      lastSyncAt: new Date().toISOString(),
      isDemo: true,
      setupGuide:
        "Requires Facebook Page Admin rights, Meta App ID with 'pages_messaging' permission, and backend webhook verification.",
      docsUrl: "https://developers.facebook.com/docs/messenger-platform",
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
      "Facebook Messenger requires backend API token. Local simulation is handled via Demo Adapter."
    );
  }

  async sendInternalNote(
    _conversationId: string,
    _content: string,
    _author: string
  ): Promise<Message> {
    throw new Error("Internal notes are stored in local CRM, not transmitted to Messenger.");
  }

  async updateStatus() {}
  async assign() {}
  async disconnect() {}
}
