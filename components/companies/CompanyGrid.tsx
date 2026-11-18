"use client";

import React from "react";
import { Building2, Users, DollarSign, Globe, MapPin, ArrowUpRight } from "lucide-react";
import { Company, Contact, Deal, PipelineStage } from "@/components/crm/types";
import { formatINR, selectCompanySummary } from "@/components/crm/selectors";

interface CompanyGridProps {
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
  stages: PipelineStage[];
  onSelectCompany: (company: Company) => void;
}

export function CompanyGrid({
  companies,
  contacts,
  deals,
  stages,
  onSelectCompany,
}: CompanyGridProps) {
  return (
    <div className="bl-companies-grid">
      {companies.map((company) => {
        const summary = selectCompanySummary(company.id, contacts, deals, stages);
        const companyContacts = contacts.filter((c) => c.companyId === company.id);

        return (
          <article
            key={company.id}
            className="bl-company-card"
            onClick={() => onSelectCompany(company)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectCompany(company);
              }
            }}
          >
            {/* Top row: Logo, Name & Status */}
            <div className="bl-between" style={{ alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <div className="bl-company-avatar">
                  {company.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="bl-company-name">{company.name}</h4>
                  <span className="bl-company-industry">{company.industry}</span>
                </div>
              </div>

              <span className={`bl-lifecycle-pill bl-status-${company.lifecycleStatus}`}>
                {company.lifecycleStatus}
              </span>
            </div>

            {/* Location & Website */}
            <div className="bl-company-meta-row">
              <span className="bl-company-loc">
                <MapPin size={12} /> {company.city}, {company.country}
              </span>
              <span className="bl-company-size">
                {company.companySize} employees
              </span>
            </div>

            {/* Financial Summary Strip */}
            <div className="bl-company-metrics-box">
              <div>
                <span className="bl-company-box-label">Won Revenue</span>
                <strong
                  className="bl-company-box-val"
                  style={{ color: summary.wonValue > 0 ? "var(--color-success)" : "var(--text)" }}
                >
                  {formatINR(summary.wonValue)}
                </strong>
              </div>
              <div>
                <span className="bl-company-box-label">Open Pipeline</span>
                <strong className="bl-company-box-val">
                  {formatINR(summary.openPipeline)}
                </strong>
              </div>
            </div>

            {/* Footer: Contacts Count & Owner */}
            <div className="bl-company-footer">
              <div className="bl-company-contacts-preview">
                <Users size={12} />
                <span>
                  <strong>{summary.contactsCount}</strong> contacts · <strong>{summary.dealsCount}</strong> deals
                </span>
              </div>

              <span className="bl-company-owner">
                {company.owner || "Unassigned"}
              </span>
            </div>
          </article>
        );
      })}

      {companies.length === 0 && (
        <div className="bl-empty" style={{ gridColumn: "1 / -1", padding: "60px 20px" }}>
          <Building2 size={36} opacity={0.3} />
          <h3>No organizations found</h3>
          <p>Try clearing your search query or industry filters.</p>
        </div>
      )}
    </div>
  );
}

export default CompanyGrid;
