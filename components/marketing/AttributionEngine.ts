/**
 * BizLead Revenue OS — Deterministic Attribution Engine
 * Distributes conversion credit across eligible campaigns without duplicating value.
 */

import {
  CampaignTouchpoint,
  AttributionModel,
  LeadAttribution,
  DealAttribution,
  Lead,
  Deal,
  MarketingCampaign,
} from "../crm/types";

export interface AttributionOptions {
  model: AttributionModel;
  lookbackDays?: number; // default 90 days, 0 = all time
}

export class AttributionEngine {
  /**
   * Resolve touchpoint for a Lead under a given attribution model.
   */
  static resolveLeadAttribution(
    lead: Lead,
    touchpoints: CampaignTouchpoint[],
    campaigns: MarketingCampaign[],
    options: AttributionOptions = { model: "first_touch" }
  ): LeadAttribution {
    const leadTouchpoints = touchpoints
      .filter((tp) => tp.leadId === lead.id || tp.contactId === lead.contactId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (leadTouchpoints.length === 0) {
      // Fallback to lead.source or lead.campaignId if available
      const directCampaign = campaigns.find(
        (c) => c.id === lead.campaignId || c.name.toLowerCase() === lead.source?.toLowerCase()
      );
      return {
        leadId: lead.id,
        campaignId: directCampaign?.id,
        campaignName: directCampaign?.name || lead.source || "Organic / Direct",
        model: options.model,
      };
    }

    const selectedTp =
      options.model === "last_touch"
        ? leadTouchpoints[leadTouchpoints.length - 1]
        : leadTouchpoints[0];

    const campaign = campaigns.find((c) => c.id === selectedTp.campaignId);

    return {
      leadId: lead.id,
      campaignId: selectedTp.campaignId,
      campaignName: campaign?.name || selectedTp.channel.replace("_", " ").toUpperCase(),
      touchpointId: selectedTp.id,
      model: options.model,
      firstTouchDate: leadTouchpoints[0].timestamp,
      lastTouchDate: leadTouchpoints[leadTouchpoints.length - 1].timestamp,
    };
  }

  /**
   * Distribute deal credit among campaigns.
   * Total attribution weight across all campaigns for a single deal NEVER exceeds 1.0 (100%).
   */
  static resolveDealAttribution(
    deal: Deal,
    touchpoints: CampaignTouchpoint[],
    campaigns: MarketingCampaign[],
    options: AttributionOptions = { model: "last_touch" }
  ): DealAttribution[] {
    // Collect all touchpoints tied to this deal, its contact, or its origin lead
    const dealTouchpoints = touchpoints
      .filter(
        (tp) =>
          tp.dealId === deal.id ||
          (deal.contactId && tp.contactId === deal.contactId) ||
          (deal.leadId && tp.leadId === deal.leadId)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // If no explicit touchpoints found, fallback to deal.source or origin lead source
    if (dealTouchpoints.length === 0) {
      const directCampaign = campaigns.find(
        (c) => c.name.toLowerCase() === deal.source?.toLowerCase() || c.id === deal.source
      );

      return [
        {
          dealId: deal.id,
          campaignId: directCampaign?.id,
          campaignName: directCampaign?.name || deal.source || "Unattributed",
          attributionWeight: 1.0,
          attributedValue: deal.value || 0,
          model: options.model,
        },
      ];
    }

    // First Touch Model
    if (options.model === "first_touch") {
      const firstTp = dealTouchpoints[0];
      const camp = campaigns.find((c) => c.id === firstTp.campaignId);
      return [
        {
          dealId: deal.id,
          campaignId: firstTp.campaignId,
          campaignName: camp?.name || firstTp.channel.toUpperCase(),
          attributionWeight: 1.0,
          attributedValue: deal.value || 0,
          model: "first_touch",
        },
      ];
    }

    // Last Touch Model (Default)
    const lastTp = dealTouchpoints[dealTouchpoints.length - 1];
    const camp = campaigns.find((c) => c.id === lastTp.campaignId);
    return [
      {
        dealId: deal.id,
        campaignId: lastTp.campaignId,
        campaignName: camp?.name || lastTp.channel.toUpperCase(),
        attributionWeight: 1.0,
        attributedValue: deal.value || 0,
        model: "last_touch",
      },
    ];
  }

  /**
   * Aggregate total attributed won value for a campaign without duplicating deal amounts.
   */
  static calculateCampaignAttributedWonValue(
    campaignId: string,
    wonDeals: Deal[],
    touchpoints: CampaignTouchpoint[],
    campaigns: MarketingCampaign[],
    options: AttributionOptions = { model: "last_touch" }
  ): { wonValue: number; wonCustomersCount: number } {
    let totalWonValue = 0;
    const customerIds = new Set<string>();

    for (const deal of wonDeals) {
      const attributions = this.resolveDealAttribution(deal, touchpoints, campaigns, options);
      const matched = attributions.find((a) => a.campaignId === campaignId);
      if (matched && matched.attributedValue > 0) {
        totalWonValue += matched.attributedValue;
        if (deal.companyId) customerIds.add(deal.companyId);
        else if (deal.contactId) customerIds.add(deal.contactId);
        else customerIds.add(deal.id);
      }
    }

    return {
      wonValue: totalWonValue,
      wonCustomersCount: customerIds.size,
    };
  }
}
