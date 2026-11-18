"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  LayoutGrid,
  Table as TableIcon,
  Plus,
  Download,
  RotateCcw,
} from "lucide-react";
import { useCRM } from "@/components/crm/CRMProvider";
import { Contact, PIPELINE_OWNERS } from "@/components/crm/types";
import { ContactDirectory } from "@/components/contacts/ContactDirectory";
import { ContactProfile } from "@/components/contacts/ContactProfile";
import { ContactTable } from "@/components/contacts/ContactTable";
import { ContactModal } from "@/components/contacts/ContactModal";
import { useControlCenter } from "@/components/settings/ControlCenterContext";

export default function ContactsPage() {
  const {
    contacts,
    companies,
    deals,
    stages,
    createContact,
    updateContact,
    createDeal,
  } = useCRM();
  const { canCreate, canEdit } = useControlCenter();

  const [viewMode, setViewMode] = useState<"split" | "table">("split");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    contacts[0]?.id || null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Selected contact object
  const currentContact =
    contacts.find((c) => c.id === selectedContactId) || contacts[0] || null;

  const handleToggleFavorite = async (id: string) => {
    const target = contacts.find((c) => c.id === id);
    if (target) {
      await updateContact(id, { isFavorite: !target.isFavorite });
    }
  };

  const handleOpenCreate = () => {
    setEditingContact(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (contact?: Contact) => {
    setEditingContact(contact || currentContact);
    setModalOpen(true);
  };

  const handleSaveContact = async (data: Partial<Contact>) => {
    if (editingContact) {
      await updateContact(editingContact.id, data);
    } else {
      const created = await createContact(
        data as Omit<Contact, "id" | "createdAt" | "updatedAt">
      );
      setSelectedContactId(created.id);
    }
  };

  const handleAddDealFromContact = async () => {
    if (!currentContact) return;
    await createDeal({
      title: `${currentContact.companyName || currentContact.name} - Opportunity`,
      companyId: currentContact.companyId,
      companyName: currentContact.companyName || "Independent",
      contactId: currentContact.id,
      contactName: currentContact.name,
      value: 75000,
      stage: "qualified",
      probability: 60,
      expectedCloseDate: new Date(Date.now() + 14 * 86400000)
        .toISOString()
        .split("T")[0],
      priority: "high",
      owner: currentContact.owner,
      source: currentContact.source,
    });
  };

  const handleBulkAssign = async (owner: string, selectedIds: string[]) => {
    for (const id of selectedIds) {
      await updateContact(id, { owner });
    }
  };

  const handleExportCSV = () => {
    function escapeCSV(val: unknown) {
      let str = String(val ?? "");
      if (/^\s*[=+\-@]/.test(str)) str = "'" + str;
      return `"${str.replaceAll('"', '""')}"`;
    }

    const headers = [
      "Contact ID",
      "Full Name",
      "Company",
      "Designation",
      "Email",
      "Phone",
      "WhatsApp",
      "Location",
      "Lifecycle Status",
      "Relationship Score",
      "Owner",
      "Acquisition Source",
      "Created Date",
    ];

    const rows = contacts.map((c) => [
      c.id,
      c.name,
      c.companyName || "",
      c.designation || "",
      c.email,
      c.phone,
      c.whatsapp || "",
      c.location || "",
      c.lifecycleStatus,
      c.relationshipScore,
      c.owner,
      c.source,
      c.createdAt,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bizlead-contacts-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bl-contacts-module">
      {/* Module Heading */}
      <section className="bl-page-heading">
        <div>
          <div className="bl-eyebrow">RELATIONSHIP OS / CONTACT 360°</div>
          <h1>Relationships that matter.</h1>
          <p>Every connection. Every interaction. One workspace.</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* View Mode Toggle: Split vs Table */}
          <div className="bl-view-toggle-group">
            <button
              type="button"
              className={`bl-view-toggle-btn ${viewMode === "split" ? "active" : ""}`}
              onClick={() => setViewMode("split")}
              title="360 Master-Detail View"
              aria-label="360 Master-Detail View"
            >
              <LayoutGrid size={15} />
              <span>Workspace</span>
            </button>
            <button
              type="button"
              className={`bl-view-toggle-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Full Table View"
              aria-label="Full Table View"
            >
              <TableIcon size={15} />
              <span>Table</span>
            </button>
          </div>

          {canCreate("contacts") && (
            <button
              type="button"
              className="bl-primary"
              onClick={handleOpenCreate}
            >
              <Plus size={16} /> Add Contact
            </button>
          )}
        </div>
      </section>

      {/* Main Content Layout */}
      {viewMode === "split" ? (
        <div className="bl-contact-split-workspace">
          {/* Left: Searchable Directory */}
          <ContactDirectory
            contacts={contacts}
            companies={companies}
            selectedContactId={currentContact?.id || null}
            onSelectContact={setSelectedContactId}
            onOpenCreateModal={handleOpenCreate}
            onToggleFavorite={handleToggleFavorite}
            onExportCSV={handleExportCSV}
            onBulkAssignOwner={handleBulkAssign}
            owners={PIPELINE_OWNERS}
          />

          {/* Right: Customer Profile 360 */}
          {currentContact ? (
            <ContactProfile
              contact={currentContact}
              deals={deals}
              stages={stages}
              onEditContact={() => handleOpenEdit(currentContact)}
              onAddDeal={handleAddDealFromContact}
              onToggleFavorite={handleToggleFavorite}
            />
          ) : (
            <div className="bl-empty-profile-placeholder">
              <Users size={40} opacity={0.3} />
              <h3>Select a Contact</h3>
              <p>Choose any relationship on the left to review their 360° customer profile.</p>
            </div>
          )}
        </div>
      ) : (
        <ContactTable
          contacts={contacts}
          deals={deals}
          stages={stages}
          onSelectContact={(id) => {
            setSelectedContactId(id);
            setViewMode("split");
          }}
          onToggleFavorite={handleToggleFavorite}
          onEditContact={handleOpenEdit}
        />
      )}

      {/* Contact Create / Edit Modal */}
      <ContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        contact={editingContact}
        companies={companies}
        existingContacts={contacts}
        onSave={handleSaveContact}
      />
    </div>
  );
}
