import { ChannelAdapter } from "./types";
import { ChannelConnection, Message, Attachment } from "../types";

export class EmailAdapter implements ChannelAdapter {
  channel = "email" as const;
  name = "Corporate Email (SMTP/IMAP / SendGrid)";

  async getConnection(): Promise<ChannelConnection> {
    return {
      id: "conn-em-01",
      channel: "email",
      name: "BizLead Sales Mailbox",
      accountIdentifier: "growth@bizlead.io",
      status: "demo_mode",
      capabilities: [
        "Inbound Email Threading",
        "Outbound HTML & Plaintext",
        "PDF/DOCX Attachment Parsing",
        "SPF / DKIM Authenticated Sending",
      ],
      lastSyncAt: new Date().toISOString(),
      isDemo: true,
      setupGuide:
        "Connect corporate email domain via MX routing (SendGrid / Mailgun / Postmark Inbound Webhook) or authenticated SMTP/IMAP server.",
      docsUrl: "https://sendgrid.com/docs/for-developers/parsing-email/inbound-email/",
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
      "Corporate email delivery requires SMTP/API credentials hosted on a secure backend."
    );
  }

  async sendInternalNote(
    _conversationId: string,
    _content: string,
    _author: string
  ): Promise<Message> {
    throw new Error("Internal notes are stored in local CRM, not transmitted via Email.");
  }

  async updateStatus() {}
  async assign() {}
  async disconnect() {}
}
