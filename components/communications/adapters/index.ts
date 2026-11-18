import { Channel } from "../types";
import { ChannelAdapter } from "./types";
import { WhatsAppAdapter } from "./whatsapp";
import { InstagramAdapter } from "./instagram";
import { MessengerAdapter } from "./messenger";
import { EmailAdapter } from "./email";
import { WebsiteChatAdapter } from "./website";

export * from "./types";
export * from "./whatsapp";
export * from "./instagram";
export * from "./messenger";
export * from "./email";
export * from "./website";

const adapters: Record<Channel, ChannelAdapter> = {
  whatsapp: new WhatsAppAdapter(),
  instagram: new InstagramAdapter(),
  messenger: new MessengerAdapter(),
  email: new EmailAdapter(),
  website: new WebsiteChatAdapter(),
};

export function getAdapterForChannel(channel: Channel): ChannelAdapter {
  return adapters[channel] || adapters.whatsapp;
}
