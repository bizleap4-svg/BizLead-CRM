"use client";

import React, { useMemo, useState } from "react";
import {
  Building2,
  Plus,
  Search,
  SlidersHorizontal,
  Download,
  LayoutGrid,
  List,
  Sparkles,
} from "lucide-react";
import { useCRM } from "@/components/crm/CRMProvider";
import {
  Company,
  Contact,
  COMPANY_INDUSTRIES,
  PIPELINE_OWNERS,
} from "@/components/crm/types";
import { selectCompanySummary } from "@/components/crm/selectors";
import { CompanyMetrics } from "@/components/companies/CompanyMetrics";
import { CompanyGrid } from "@/components/companies/CompanyGrid";
import { CompanyTable } from "@/components/companies/CompanyTable";
import { CompanyDetailModal } from "@/components/companies/CompanyDetailModal";
import { CompanyModal } from "@/components/companies/CompanyModal";
import { ContactModal } from "@/components/contacts/ContactModal";

export default function CompaniesPage() {
  const {
    companies,
    contacts,
    deals,
    stages,
    createCompany,
    updateCompany,
    createContact,
  } = useCRM();

  // View & Filter States
  const [view, setView] = useState<"grid" | "table">("grid");
  const [query, setQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All industries");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [ownerFilter, setOwnerFilter] = useState("All owners");
  const [sortBy, setSortBy] = useState<"name" | "pipeline" | "revenue" | "recent">("name");
  const [showFilters, setShowFilters] = useState(false);

  // Modals & Drawers
  const [detailCompany, setDetailCompany] = useState<Company | null>(null);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Contact Modal (for adding contact directly to a selected company)
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [targetCompanyForContact, setTargetCompanyForContact] = useState<Company | null>(null);

  // Filtering & Sorting
  const filteredCompanies = useMemo(() => {
    return companies
      .filter((company) => {
        const q = query.toLowerCase();
        const matchesQuery =
          company.name.toLowerCase().includes(q) ||
          company.industry.toLowerCase().includes(q) ||
          company.city.toLowerCase().includes(q) ||
          company.owner.toLowerCase().includes(q) ||
          (company.website && company.website.toLowerCase().includes(q));

        const matchesIndustry =
          industryFilter === "All industries" ||
          company.industry === industryFilter;

        const matchesStatus =
          statusFilter === "All statuses" ||
          company.lifecycleStatus === statusFilter;

        const matchesOwner =
          ownerFilter === "All owners" || company.owner === ownerFilter;

        return matchesQuery && matchesIndustry && matchesStatus && matchesOwner;
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "pipeline") {
          const sumA = selectCompanySummary(a.id, contacts, deals, stages).openPipelineValue;
          const sumB = selectCompanySummary(b.id, contacts, deals, stages).openPipelineValue;
          return sumB - sumA;
        }
        if (sortBy === "revenue") {
          const sumA = selectCompanySummary(a.id, contacts, deals, stages).totalWonRevenue;
          const sumB = selectCompanySummary(b.id, contacts, deals, stages).totalWonRevenue;
          return sumB - sumA;
        }
        if (sortBy === "recent") {
          return (
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
          );
        }
        return 0;
      });
  }, [
    companies,
    contacts,
    deals,
    stages,
    query,
    industryFilter,
    statusFilter,
    ownerFilter,
    sortBy,
  ]);

  // Keep detail company in sync with updated list
  const activeDetailCompany = detailCompany
    ? companies.find((c) => c.id === detailCompany.id) || null
    : null;

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingCompany(null);
    setCompanyModalOpen(true);
  };

  const handleOpenEditModal = (comp: Company) => {
    setEditingCompany(comp);
    setCompanyModalOpen(true);
  };

  const handleSaveCompany = async (data: Partial<Company>) => {
    if (editingCompany) {
      await updateCompany(editingCompany.id, data);
    } else {
      await createCompany(data as any);
    }
  };

  const handleAddContactFromDetail = (comp: Company) => {
    setTargetCompanyForContact(comp);
    setContactModalOpen(true);
  };

  const handleSaveNewContact = async (data: Partial<Contact>) => {
    await createContact({
      ...data,
      companyId: targetCompanyForContact?.id || data.companyId || "",
      companyName: targetCompanyForContact?.name || data.companyName || "",
    } as any);
    setContactModalOpen(false);
  };

  // CSV Export
  const handleExportCSV = () => {
    function escapeCSV(value: unknown) {
      let text = String(value ?? "");
      if (/^\s*[=+\-@]/.test(text)) text = "'" + text;
      return `"${text.replaceAll('"', '""')}"`;
    }

    const headers = [
      "Company Name",
      "Industry",
      "Size",
      "Website",
      "Email",
      "Phone",
      "City",
      "Country",
      "Lifecycle Status",
      "Account Owner",
      "Key Contacts Count",
      "Open Pipeline (INR)",
      "Won Revenue (INR)",
    ];

    const rows = filteredCompanies.map((c) => {
      const summary = selectCompanySummary(c.id, contacts, deals, stages);
      return [
        c.name,
        c.industry,
        c.companySize,
        c.website,
        c.businessEmail,
        c.businessPhone,
        c.city,
        c.country,
        c.lifecycleStatus,
        c.owner,
        summary.contactsCount,
        summary.openPipelineValue,
        summary.totalWonRevenue,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((r) => r.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bizlead-companies-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="bl-companies-page">
      {/* Page Header */}
      <div className="bl-page-heading">
        <div>
          <div className="bl-eyebrow">ACCOUNTS / COMPANY INTELLIGENCE</div>
          <h1>Business, connected.</h1>
          <p>Understand the organizations behind your opportunities.</p>
        </div>

        <div className="bl-header-actions">
          <button className="bl-primary" onClick={handleOpenCreateModal}>
            <Plus size={18} /> Add company
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <CompanyMetrics
        companies={companies}
        deals={deals}
        stages={stages}
      />

      {/* Toolbar & Controls */}
      <div className="bl-toolbar-card">
        <div className="bl-toolbar-left">
          <div className="bl-search-input-wrap">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search companies by name, city, industry, owner..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search companies"
            />
          </div>

          <button
            type="button"
            className={`bl-toolbar-btn ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
            {(industryFilter !== "All industries" ||
              statusFilter !== "All statuses" ||
              ownerFilter !== "All owners") && (
              <span className="bl-filter-badge-dot" />
            )}
          </button>
        </div>

        <div className="bl-toolbar-right">
          <div className="bl-sort-wrap">
            <span className="bl-label-sub">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bl-select-compact"
              aria-label="Sort companies by"
            >
              <option value="name">Name (A-Z)</option>
              <option value="pipeline">Open Pipeline</option>
              <option value="revenue">Won Revenue</option>
              <option value="recent">Recently Active</option>
            </select>
          </div>

          {/* Grid / Table Toggle */}
          <div className="bl-view-switch" role="group" aria-label="View toggle">
            <button
              type="button"
              className={`bl-view-btn ${view === "grid" ? "active" : ""}`}
              onClick={() => setView("grid")}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              className={`bl-view-btn ${view === "table" ? "active" : ""}`}
              onClick={() => setView("table")}
              title="Table View"
              aria-label="Table View"
            >
              <List size={16} />
            </button>
          </div>

          <button
            type="button"
            className="bl-secondary bl-export-btn"
            onClick={handleExportCSV}
            title="Export companies to CSV"
          >
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <div className="bl-expandable-filters">
          <div className="bl-filter-item">
            <label>Industry</label>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
            >
              <option value="All industries">All industries</option>
              {COMPANY_INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          <div className="bl-filter-item">
            <label>Account Lifecycle</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All statuses">All statuses</option>
              <option value="prospect">Prospect</option>
              <option value="active">Active Customer</option>
              <option value="enterprise">Enterprise Tier</option>
              <option value="inactive">Inactive / Past</option>
            </select>
          </div>

          <div className="bl-filter-item">
            <label>Account Owner</label>
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
            >
              <option value="All owners">All owners</option>
              {PIPELINE_OWNERS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          {(industryFilter !== "All industries" ||
            statusFilter !== "All statuses" ||
            ownerFilter !== "All owners" ||
            query) && (
            <button
              type="button"
              className="bl-clear-filters-btn"
              onClick={() => {
                setIndustryFilter("All industries");
                setStatusFilter("All statuses");
                setOwnerFilter("All owners");
                setQuery("");
              }}
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Content Rendering: Grid vs Table */}
      {filteredCompanies.length > 0 ? (
        view === "grid" ? (
          <CompanyGrid
            companies={filteredCompanies}
            contacts={contacts}
            deals={deals}
            stages={stages}
            onSelectCompany={(c) => setDetailCompany(c)}
          />
        ) : (
          <CompanyTable
            companies={filteredCompanies}
            contacts={contacts}
            deals={deals}
            stages={stages}
            onSelectCompany={(c) => setDetailCompany(c)}
          />
        )
      ) : (
        <div className="bl-empty-state">
          <Building2 size={40} strokeWidth={1.3} />
          <h3>No companies found</h3>
          <p>
            No organizations match your current search query or active filter
            criteria.
          </p>
          <button
            type="button"
            className="bl-secondary"
            onClick={() => {
              setQuery("");
              setIndustryFilter("All industries");
              setStatusFilter("All statuses");
              setOwnerFilter("All owners");
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Company Detail Workspace Modal */}
      <CompanyDetailModal
        company={activeDetailCompany}
        isOpen={Boolean(activeDetailCompany)}
        onClose={() => setDetailCompany(null)}
        contacts={contacts}
        deals={deals}
        stages={stages}
        onEditCompany={(comp) => {
          setDetailCompany(null);
          handleOpenEditModal(comp);
        }}
        onAddContactToCompany={(comp) => {
          handleAddContactFromDetail(comp);
        }}
        onAddDealToCompany={(comp) => {
          // Future deal creation link or navigate to pipeline
        }}
      />

      {/* Create / Edit Company Modal */}
      <CompanyModal
        isOpen={companyModalOpen}
        onClose={() => {
          setCompanyModalOpen(false);
          setEditingCompany(null);
        }}
        company={editingCompany}
        existingCompanies={companies}
        onSave={handleSaveCompany}
      />

      {/* Quick Add Contact to Company Modal */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => {
          setContactModalOpen(false);
          setTargetCompanyForContact(null);
        }}
        contact={null}
        companies={companies}
        existingContacts={contacts}
        onSave={handleSaveNewContact}
      />
    </section>
  );
}
