"use client";

import React from "react";
import { Star, Mail, Phone, Building2, ChevronRight, MoreVertical } from "lucide-react";
import { Contact, Deal, PipelineStage } from "@/components/crm/types";
import { formatINR, selectContactWonValue } from "@/components/crm/selectors";

interface ContactTableProps {
  contacts: Contact[];
  deals: Deal[];
  stages: PipelineStage[];
  onSelectContact: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onEditContact: (contact: Contact) => void;
}

export function ContactTable({
  contacts,
  deals,
  stages,
  onSelectContact,
  onToggleFavorite,
  onEditContact,
}: ContactTableProps) {
  return (
    <div className="bl-table-panel bl-contacts-table-panel">
      <div className="bl-table-scroll">
        <table className="bl-data-table">
          <thead>
            <tr>
              <th style={{ width: "32px" }}>Fav</th>
              <th>Contact Name</th>
              <th>Designation & Organization</th>
              <th>Email</th>
              <th>Phone / WhatsApp</th>
              <th>Status</th>
              <th>Score</th>
              <th>Account Owner</th>
              <th>Won Revenue</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => {
              const wonVal = selectContactWonValue(contact.id, deals, stages);
              return (
                <tr
                  key={contact.id}
                  onClick={() => onSelectContact(contact.id)}
                  style={{ cursor: "pointer" }}
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className={`bl-star-btn ${contact.isFavorite ? "active" : ""}`}
                      onClick={() => onToggleFavorite(contact.id)}
                      title={contact.isFavorite ? "Unstar" : "Star"}
                      aria-label="Star contact"
                    >
                      <Star
                        size={14}
                        fill={contact.isFavorite ? "var(--accent)" : "none"}
                      />
                    </button>
                  </td>

                  <td>
                    <div className="bl-person">
                      <div className="bl-person-avatar">
                        {contact.avatar || contact.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <strong>{contact.name}</strong>
                        <small style={{ color: "var(--muted)" }}>
                          {contact.location || "India"}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div>
                      <strong>{contact.companyName || "Independent"}</strong>
                      <small style={{ color: "var(--muted)", display: "block" }}>
                        {contact.designation || "Executive"}
                      </small>
                    </div>
                  </td>

                  <td>
                    <a
                      href={`mailto:${contact.email}`}
                      className="bl-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {contact.email}
                    </a>
                  </td>

                  <td>{contact.phone || "-"}</td>

                  <td>
                    <span className={`bl-lifecycle-pill bl-status-${contact.lifecycleStatus}`}>
                      {contact.lifecycleStatus}
                    </span>
                  </td>

                  <td>
                    <div className="bl-score">
                      <div className="bl-score-track">
                        <span style={{ width: `${contact.relationshipScore}%` }} />
                      </div>
                      {contact.relationshipScore}
                    </div>
                  </td>

                  <td>{contact.owner || "Unassigned"}</td>

                  <td style={{ fontWeight: 600 }}>{formatINR(wonVal)}</td>

                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="bl-icon bl-icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectContact(contact.id);
                      }}
                      title="Open 360 profile"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {contacts.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "40px" }}>
                  <div className="bl-empty">
                    <h3>No contacts found</h3>
                    <p>Try clearing your search query or filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bl-table-footer">
        Showing {contacts.length} contacts across all accounts
      </div>
    </div>
  );
}

export default ContactTable;
