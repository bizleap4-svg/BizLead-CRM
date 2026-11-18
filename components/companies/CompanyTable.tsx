"use client";

import React from "react";
import { Building2, Globe, MapPin, ChevronRight, Users } from "lucide-react";
import { Company, Contact, Deal, PipelineStage } from "@/components/crm/types";
import { formatINR, selectCompanySummary } from "@/components/crm/selectors";

interface CompanyTableProps {
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
  stages: PipelineStage[];
  onSelectCompany: (company: Company) => void;
}

export function CompanyTable({
  companies,
  contacts,
  deals,
  stages,
  onSelectCompany,
}: CompanyTableProps) {
  return (
    <div className="bl-table-panel bl-companies-table-panel">
      <div className="bl-table-scroll">
        <table className="bl-data-table">
          <thead>
            <tr>
              <th>Organization</th>
              <th>Industry</th>
              <th>Location</th>
              <th>Account Status</th>
              <th>Key Contacts</th>
              <th>Open Pipeline</th>
              <th>Won Revenue</th>
              <th>Account Owner</th>
              <th style={{ textAlign: "right" }}>Workspace</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => {
              const summary = selectCompanySummary(company.id, contacts, deals, stages);
              return (
                <tr
                  key={company.id}
                  onClick={() => onSelectCompany(company)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <div className="bl-person">
                      <div className="bl-person-avatar">
                        {company.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <strong>{company.name}</strong>
                        <small style={{ color: "var(--muted)" }}>
                          {company.website || "No website"}
                        </small>
                      </div>
                    </div>
                  </td>

                  <td>{company.industry}</td>

                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={12} opacity={0.6} /> {company.city}, {company.country}
                    </span>
                  </td>

                  <td>
                    <span className={`bl-lifecycle-pill bl-status-${company.lifecycleStatus}`}>
                      {company.lifecycleStatus}
                    </span>
                  </td>

                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                      <Users size={12} opacity={0.7} /> {summary.contactsCount} contacts
                    </span>
                  </td>

                  <td>{formatINR(summary.openPipeline)}</td>

                  <td style={{ fontWeight: 600, color: "#16825B" }}>
                    {formatINR(summary.wonValue)}
                  </td>

                  <td>{company.owner || "Unassigned"}</td>

                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="bl-icon bl-icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCompany(company);
                      }}
                      title="Open Company Workspace"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {companies.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "40px" }}>
                  <div className="bl-empty">
                    <h3>No companies found</h3>
                    <p>Try clearing your filters or search terms.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bl-table-footer">
        Showing {companies.length} business organizations
      </div>
    </div>
  );
}

export default CompanyTable;
