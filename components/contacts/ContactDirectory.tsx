"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  SlidersHorizontal,
  Star,
  Download,
  Upload,
  UserCheck,
  Building2,
  Trash2,
  CheckSquare,
} from "lucide-react";
import { Contact, Company } from "@/components/crm/types";

interface ContactDirectoryProps {
  contacts: Contact[];
  companies: Company[];
  selectedContactId: string | null;
  onSelectContact: (id: string) => void;
  onOpenCreateModal: () => void;
  onToggleFavorite: (id: string) => void;
  onExportCSV: () => void;
  onBulkAssignOwner: (owner: string, selectedIds: string[]) => void;
  owners: string[];
}

export function ContactDirectory({
  contacts,
  companies,
  selectedContactId,
  onSelectContact,
  onOpenCreateModal,
  onToggleFavorite,
  onExportCSV,
  onBulkAssignOwner,
  owners,
}: ContactDirectoryProps) {
  const [search, setSearch] = useState("");
  const [activeChip, setActiveChip] = useState<
    "all" | "customers" | "prospects" | "favorites" | "recent"
  >("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchSearch =
        !search ||
        `${c.name} ${c.companyName || ""} ${c.email} ${c.phone} ${c.designation || ""}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchChip =
        activeChip === "all"
          ? true
          : activeChip === "customers"
          ? c.lifecycleStatus === "customer" || c.lifecycleStatus === "evangelist"
          : activeChip === "prospects"
          ? c.lifecycleStatus === "prospect" || c.lifecycleStatus === "lead"
          : activeChip === "favorites"
          ? c.isFavorite
          : activeChip === "recent"
          ? true
          : true;

      const matchCompany =
        companyFilter === "all" || c.companyId === companyFilter;
      const matchOwner = ownerFilter === "all" || c.owner === ownerFilter;

      return matchSearch && matchChip && matchCompany && matchOwner;
    });
  }, [contacts, search, activeChip, companyFilter, ownerFilter]);

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredContacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContacts.map((c) => c.id));
    }
  };

  return (
    <aside className="bl-contact-directory-sidebar" aria-label="Contact Directory">
      {/* Directory Top Bar */}
      <div className="bl-directory-header">
        <div className="bl-between">
          <div>
            <h3 className="bl-directory-title">Contacts</h3>
            <span className="bl-directory-sub">
              {filteredContacts.length} of {contacts.length} connections
            </span>
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              className="bl-icon bl-icon-sm"
              onClick={onExportCSV}
              title="Export CSV"
              aria-label="Export CSV"
            >
              <Download size={14} />
            </button>
            <button
              type="button"
              className="bl-primary bl-btn-sm"
              onClick={onOpenCreateModal}
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bl-search" style={{ marginTop: "12px", width: "100%" }}>
          <Search size={15} />
          <input
            placeholder="Search contacts, emails, roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search contacts"
          />
        </div>

        {/* Filter Chips */}
        <div className="bl-chips-scroll">
          {[
            { id: "all", label: "All" },
            { id: "customers", label: "Customers" },
            { id: "prospects", label: "Prospects" },
            { id: "favorites", label: "★ Favorites" },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              className={`bl-chip-pill ${activeChip === chip.id ? "active" : ""}`}
              onClick={() => setActiveChip(chip.id as any)}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Secondary Dropdown Filters */}
        <div className="bl-directory-dropdowns">
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            aria-label="Filter by organization"
          >
            <option value="all">All Companies</option>
            {companies.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.name}
              </option>
            ))}
          </select>

          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            aria-label="Filter by owner"
          >
            <option value="all">All Owners</option>
            {owners.map((ow) => (
              <option key={ow} value={ow}>
                {ow}
              </option>
            ))}
          </select>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="bl-bulk-bar">
            <span>{selectedIds.length} selected</span>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  onBulkAssignOwner(e.target.value, selectedIds);
                  setSelectedIds([]);
                }
              }}
            >
              <option value="">Assign owner...</option>
              {owners.map((ow) => (
                <option key={ow} value={ow}>
                  {ow}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="bl-btn-link"
              onClick={() => setSelectedIds([])}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Contacts List */}
      <div className="bl-directory-list">
        {filteredContacts.map((contact) => {
          const isSelected = contact.id === selectedContactId;
          const isChecked = selectedIds.includes(contact.id);

          return (
            <article
              key={contact.id}
              className={`bl-contact-card-item ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectContact(contact.id)}
              role="button"
              tabIndex={0}
            >
              <div
                className="bl-contact-checkbox"
                onClick={(e) => toggleSelect(contact.id, e)}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  aria-label={`Select ${contact.name}`}
                />
              </div>

              <div className="bl-contact-card-avatar">
                {contact.avatar || contact.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="bl-contact-card-info">
                <div className="bl-between">
                  <h4 className="bl-contact-card-name">{contact.name}</h4>
                  <button
                    type="button"
                    className={`bl-star-icon-btn ${contact.isFavorite ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(contact.id);
                    }}
                    title={contact.isFavorite ? "Unstar" : "Star"}
                  >
                    <Star
                      size={12}
                      fill={contact.isFavorite ? "var(--accent)" : "none"}
                    />
                  </button>
                </div>

                <span className="bl-contact-card-company">
                  {contact.designation ? `${contact.designation} · ` : ""}
                  {contact.companyName || "No Company"}
                </span>

                <div className="bl-contact-card-footer">
                  <span className={`bl-lifecycle-mini bl-status-${contact.lifecycleStatus}`}>
                    {contact.lifecycleStatus}
                  </span>
                  <span className="bl-contact-score-badge">
                    Score {contact.relationshipScore}
                  </span>
                </div>
              </div>
            </article>
          );
        })}

        {filteredContacts.length === 0 && (
          <div className="bl-empty-stream" style={{ padding: "30px 14px" }}>
            <p>No matching contacts found.</p>
          </div>
        )}
      </div>
    </aside>
  );
}

export default ContactDirectory;
