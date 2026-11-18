"use client";

import React, { useState } from "react";
import { AIContext } from "./types";
import { Lead, Deal, MarketingCampaign, Contact, Company } from "../crm/types";
import { Tabs } from "../ui/Tabs";
import {
  Paperclip,
  X,
  Search,
  UsersRound,
  Kanban,
  Building2,
  Target,
  ContactRound,
  Check,
} from "lucide-react";

interface AIContextPickerProps {
  context: AIContext | null;
  onSelectContext: (ctx: AIContext | null) => void;
  leads: Lead[];
  deals: Deal[];
  companies: Company[];
  campaigns: MarketingCampaign[];
  contacts: Contact[];
}

export const AIContextPicker: React.FC<AIContextPickerProps> = ({
  context,
  onSelectContext,
  leads,
  deals,
  companies,
  campaigns,
  contacts,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"lead" | "deal" | "company" | "campaign">("lead");
  const [search, setSearch] = useState("");

  const getFilteredItems = () => {
    const q = search.toLowerCase().trim();
    switch (tab) {
      case "lead":
        return leads
          .filter((l) => !q || l.name.toLowerCase().includes(q) || (l.company || "").toLowerCase().includes(q))
          .slice(0, 8)
          .map((l) => ({ id: l.id, name: l.name, sub: l.company, type: "lead" as const }));
      case "deal":
        return deals
          .filter((d) => !q || d.title.toLowerCase().includes(q))
          .slice(0, 8)
          .map((d) => ({ id: d.id, name: d.title, sub: `₹${d.value.toLocaleString("en-IN")}`, type: "deal" as const }));
      case "company":
        return companies
          .filter((c) => !q || c.name.toLowerCase().includes(q))
          .slice(0, 8)
          .map((c) => ({ id: c.id, name: c.name, sub: c.industry || "Account", type: "company" as const }));
      case "campaign":
        return campaigns
          .filter((c) => !q || c.name.toLowerCase().includes(q))
          .slice(0, 8)
          .map((c) => ({ id: c.id, name: c.name, sub: c.platform.toUpperCase(), type: "campaign" as const }));
    }
  };

  const handleSelect = (item: { id: string; name: string; type: any }) => {
    onSelectContext({
      selectedEntityType: item.type,
      selectedEntityId: item.id,
      selectedEntityName: item.name,
    });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Context Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Attach CRM Record Context"
        className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
          context
            ? "bg-primary/10 text-primary border border-primary/30"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <Paperclip className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">
          {context?.selectedEntityName ? context.selectedEntityName : "Attach Context"}
        </span>
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          className="absolute bottom-full mb-2 left-0 w-80 bg-card border border-border rounded-xl shadow-xl p-3 space-y-2.5 animate-in zoom-in-95 duration-100"
          style={{ zIndex: "var(--z-dropdown)" }}
        >
          <div className="flex items-center justify-between pb-2 border-b">
            <span className="text-xs font-bold text-foreground">Attach Record Context</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Type Tabs */}
          <div style={{ margin: "2px 0 8px" }}>
            <Tabs
              items={[
                { id: "lead", label: "Leads" },
                { id: "deal", label: "Deals" },
                { id: "company", label: "Companies" },
                { id: "campaign", label: "Campaigns" },
              ]}
              activeTab={tab}
              onChange={(t) => setTab(t as any)}
              variant="pills"
              size="sm"
              ariaLabel="Context entity type"
            />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${tab}s...`}
              className="w-full pl-7 pr-3 py-1.5 rounded-lg border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Items List */}
          <div className="max-h-44 overflow-y-auto space-y-1">
            {getFilteredItems().map((item) => {
              const isSelected = context?.selectedEntityId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`p-2 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors ${
                    isSelected ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted/40 text-foreground"
                  }`}
                >
                  <div className="overflow-hidden pr-2">
                    <div className="truncate font-medium">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{item.sub}</div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Clear Context Action */}
          {context && (
            <div className="pt-2 border-t">
              <button
                type="button"
                onClick={() => {
                  onSelectContext(null);
                  setIsOpen(false);
                }}
                className="w-full py-1 text-center text-[11px] text-rose-500 hover:underline font-semibold"
              >
                Clear Attached Context
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
