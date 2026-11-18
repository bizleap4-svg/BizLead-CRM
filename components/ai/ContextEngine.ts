/**
 * BizLead Revenue OS — AI Context Engine
 * Sanitizes untrusted CRM records and formats minimal context payloads.
 */

import { Lead, Deal, Contact, Company, CRMTask, MarketingCampaign } from "../crm/types";
import { AIContext } from "./types";

export class ContextEngine {
  /**
   * Sanitizes untrusted text from notes, customer messages, or emails.
   * Strips control codes and wraps text safely so it cannot be interpreted as instructions.
   */
  static sanitizeUntrustedText(input: string | undefined | null): string {
    if (!input) return "";
    return input
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // strip ASCII control characters
      .replace(/[<>]/g, (char) => (char === "<" ? "&lt;" : "&gt;"))
      .trim();
  }

  /**
   * Builds an isolated context block for an attached CRM record.
   */
  static buildRecordContext(
    context: AIContext,
    records: {
      leads: Lead[];
      deals: Deal[];
      contacts: Contact[];
      companies: Company[];
      tasks: CRMTask[];
      campaigns: MarketingCampaign[];
    }
  ): { summary: string; entityName?: string; record?: any } | null {
    if (!context.selectedEntityType || !context.selectedEntityId) return null;

    const { selectedEntityType, selectedEntityId } = context;

    switch (selectedEntityType) {
      case "lead": {
        const lead = records.leads.find((l) => l.id === selectedEntityId);
        if (!lead) return null;
        return {
          entityName: `${lead.name} (${lead.company})`,
          record: lead,
          summary: `[CONTEXT LEAD RECORD: ID=${lead.id}, Name=${lead.name}, Company=${lead.company}, Score=${lead.score}, Stage=${lead.stage}, Value=₹${lead.value.toLocaleString("en-IN")}, Owner=${lead.owner || "Unassigned"}, NextFollowUp=${lead.nextFollowUp || "None"}, Notes=${this.sanitizeUntrustedText(lead.notes)}]`,
        };
      }
      case "deal": {
        const deal = records.deals.find((d) => d.id === selectedEntityId);
        if (!deal) return null;
        return {
          entityName: deal.title,
          record: deal,
          summary: `[CONTEXT DEAL RECORD: ID=${deal.id}, Title=${deal.title}, Stage=${deal.stage}, Value=₹${deal.value.toLocaleString("en-IN")}, Probability=${deal.probability}%, CloseDate=${deal.expectedCloseDate || "None"}]`,
        };
      }
      case "campaign": {
        const camp = records.campaigns.find((c) => c.id === selectedEntityId);
        if (!camp) return null;
        return {
          entityName: camp.name,
          record: camp,
          summary: `[CONTEXT CAMPAIGN RECORD: ID=${camp.id}, Name=${camp.name}, Platform=${camp.platform}, PlannedBudget=₹${(camp.plannedBudget || 0).toLocaleString("en-IN")}, Status=${camp.status}]`,
        };
      }
      case "contact": {
        const contact = records.contacts.find((c) => c.id === selectedEntityId);
        if (!contact) return null;
        return {
          entityName: contact.name,
          record: contact,
          summary: `[CONTEXT CONTACT RECORD: ID=${contact.id}, Name=${contact.name}, Designation=${contact.designation || "N/A"}, Company=${contact.companyName || "N/A"}, Email=${contact.email}]`,
        };
      }
      case "company": {
        const comp = records.companies.find((c) => c.id === selectedEntityId);
        if (!comp) return null;
        return {
          entityName: comp.name,
          record: comp,
          summary: `[CONTEXT COMPANY RECORD: ID=${comp.id}, Name=${comp.name}, Industry=${comp.industry || "N/A"}, Size=${comp.companySize || "N/A"}, Status=${comp.lifecycleStatus || "N/A"}]`,
        };
      }
      default:
        return null;
    }
  }
}
