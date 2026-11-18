import { ChannelAdapter } from "./types";
import { ChannelConnection, Message, Attachment } from "../types";

export class InstagramAdapter implements ChannelAdapter {
  channel = "instagram" as const;
  name = "Instagram Messaging API";

  async getConnection(): Promise<ChannelConnection> {
    return {
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
      lastSyncAt: new Date().toISOString(),
      isDemo: true,
      setupGuide:
        "Requires an Instagram Professional/Creator account connected to a verified Facebook Page, with 'instagram_manage_messages' permission granted via Meta App Review.",
      docsUrl: "https://developers.facebook.com/docs/messenger-platform/instagram",
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
      "Instagram Direct API requires backend Meta Graph endpoint. Local simulation is handled via Demo Adapter."
    );
  }

  async sendInternalNote(
    _conversationId: string,
    _content: string,
    _author: string
  ): Promise<Message> {
    throw new Error("Internal notes are stored in local CRM, not transmitted to Instagram.");
  }

  async updateStatus() {}
  async assign() {}
  async disconnect() {}
}
