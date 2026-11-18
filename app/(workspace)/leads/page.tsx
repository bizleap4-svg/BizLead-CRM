"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Download,
  ArrowUpRight,
  X,
  Sparkles,
  ChevronRight,
  UsersRound,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { useCRM } from "@/components/crm/CRMProvider";
import { Lead, PIPELINE_OWNERS } from "@/components/crm/types";
import { LeadConvertModal } from "@/components/leads/LeadConvertModal";

function newLeadTemplate(): Lead {
  return {
    id: `temp-${Date.now()}`,
    name: "",
    company: "",
    email: "",
    phone: "",
    source: "Manual",
    stage: "new",
    score: 60,
    owner: "",
    value: 0,
    probability: 30,
    expectedCloseDate: new Date().toISOString().split("T")[0],
    priority: "medium",
    nextFollowUp: "Schedule intro call",
    notes: "",
    createdAt: new Date().toISOString(),
  };
}

const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default function LeadsPage() {
  const {
    leads,
    stages,
    contacts,
    companies,
    createLead,
    updateLead,
    convertLead,
  } = useCRM();

  const [query, setQuery] = useState("");
  const [view, setView] = useState("All leads");
  const [stageFilter, setStageFilter] = useState("All stages");
  const [sourceFilter, setSourceFilter] = useState("All sources");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [draft, setDraft] = useState<Lead | null>(null);
  const [convertTarget, setConvertTarget] = useState<Lead | null>(null);

  const handlePerformConversion = async (params: any) => {
    await convertLead(params);
    setConvertTarget(null);
    if (draft && draft.id === params.leadId) {
      setDraft((prev) => (prev ? { ...prev, isConverted: true } : null));
    }
  };

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        `${lead.name} ${lead.company} ${lead.email} ${lead.source}`
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesView =
        view === "All leads" ||
        (view === "High intent" && lead.score >= 80) ||
        (view === "Unassigned" && !lead.owner);

      const matchesStage =
        stageFilter === "All stages" ||
        lead.stage.toLowerCase() === stageFilter.toLowerCase();

      const matchesSource =
        sourceFilter === "All sources" || lead.source === sourceFilter;

      return matchesSearch && matchesView && matchesStage && matchesSource;
    });
  }, [leads, query, view, stageFilter, sourceFilter]);

  async function saveLead(event: FormEvent) {
    event.preventDefault();
    if (!draft || !draft.name.trim()) return;

    const exists = leads.some((l) => l.id === draft.id);
    if (exists) {
      await updateLead(draft.id, {
        name: draft.name.trim(),
        company: draft.company || draft.name,
        email: draft.email || "",
        phone: draft.phone || "",
        source: draft.source,
        stage: draft.stage,
        score: draft.score,
        owner: draft.owner,
        value: draft.value,
        notes: draft.notes,
      });
    } else {
      await createLead({
        name: draft.name.trim(),
        company: draft.company.trim() || draft.name.trim(),
        email: draft.email || "",
        phone: draft.phone || "",
        source: draft.source || "Manual",
        stage: draft.stage || "new",
        score: draft.score || 50,
        owner: draft.owner || "",
        value: draft.value || 0,
        probability: draft.probability || 30,
        expectedCloseDate: draft.expectedCloseDate || new Date().toISOString().split("T")[0],
        priority: draft.priority || "medium",
        notes: draft.notes || "",
      });
    }

    setDraft(null);
  }

  function toggleSelection(id: string) {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  }

  async function assignSelected(owner: string) {
    for (const id of selected) {
      await updateLead(id, { owner });
    }
    setSelected([]);
  }

  function exportCSV() {
    const items = selected.length
      ? leads.filter((lead) => selected.includes(lead.id))
      : filtered;

    function escapeCSV(value: unknown) {
      let text = String(value ?? "");
      // Protect spreadsheet users from formula injection.
      if (/^\s*[=+\-@]/.test(text)) text = "'" + text;
      return `"${text.replaceAll('"', '""')}"`;
    }

    const rows = [
      ["Name", "Company", "Email", "Source", "Stage", "Score", "Owner", "Value"],
      ...items.map((lead) => [
        lead.name,
        lead.company,
        lead.email,
        lead.source,
        lead.stage,
        lead.score,
        lead.owner,
        lead.value,
      ]),
    ];

    const csv = rows
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], {
        type: "text/csv;charset=utf-8;",
      })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `bizlead-leads-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="bl-leads">
      <div className="bl-page-heading">
        <div>
          <div className="bl-eyebrow">
            ACQUISITION / LEAD INTELLIGENCE
          </div>
          <h1>Your next opportunity.</h1>
          <p>Capture, qualify and convert every lead.</p>
        </div>

        <button
          className="bl-primary"
          onClick={() => setDraft(newLeadTemplate())}
        >
          <Plus size={18} /> Add lead
        </button>
      </div>

      <div className="bl-lead-metrics">
        {[
          ["All leads", leads.length],
          ["New leads", leads.filter(l => l.stage.toLowerCase() === "new").length],
          ["High intent", leads.filter(l => l.score >= 80).length],
          ["Unassigned", leads.filter(l => !l.owner).length],
        ].map(([label, value], index) => (
          <article
            key={label}
            className={`bl-stat ${index === 2 ? "highlight" : ""}`}
          >
            <div className="bl-between">
              <span>{label}</span>
              <ArrowUpRight size={16} />
            </div>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <article className="bl-table-panel">
        <div className="bl-tabs">
          {["All leads", "High intent", "Unassigned"].map((item) => (
            <button
              key={item}
              className={view === item ? "active" : ""}
              onClick={() => {
                setView(item);
                setSelected([]);
              }}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="bl-toolbar">
          <div className="bl-search">
            <Search size={17} />
            <input
              value={query}
              placeholder="Search leads..."
              aria-label="Search leads"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <button
            className="bl-secondary"
            aria-expanded={showFilters}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>

          <button
            className="bl-secondary bl-export"
            onClick={exportCSV}
          >
            <Download size={16} /> Export
          </button>
        </div>

        {showFilters && (
          <div className="bl-filter-row">
            <select
              aria-label="Filter by stage"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
            >
              <option>All stages</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by source"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option>All sources</option>
              {Array.from(new Set(leads.map((l) => l.source))).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <button
              className="bl-secondary"
              onClick={() => {
                setQuery("");
                setStageFilter("All stages");
                setSourceFilter("All sources");
                setView("All leads");
                setSelected([]);
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {selected.length > 0 && (
          <div className="bl-selection-bar">
            <strong>{selected.length} selected</strong>

            <select
              aria-label="Bulk assign owner"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  assignSelected(e.target.value);
                }
              }}
            >
              <option value="">Assign owner</option>
              {PIPELINE_OWNERS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>

            <button
              className="bl-secondary"
              onClick={() => setSelected([])}
            >
              Clear
            </button>
          </div>
        )}

        <div className="bl-table-scroll">
          <table className="bl-data-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label="Select all visible leads"
                    checked={
                      filtered.length > 0 &&
                      filtered.every((l) => selected.includes(l.id))
                    }
                    onChange={(e) =>
                      setSelected((previous) =>
                        e.target.checked
                          ? [
                              ...new Set([
                                ...previous,
                                ...filtered.map((l) => l.id),
                              ]),
                            ]
                          : previous.filter(
                              (id) => !filtered.some((l) => l.id === id)
                            )
                      )
                    }
                  />
                </th>
                <th>Lead / Company</th>
                <th>Source</th>
                <th>Stage</th>
                <th>Lead score</th>
                <th>Deal value</th>
                <th>Owner</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {filtered.map((lead) => {
                const stageObj = stages.find(
                  (s) => s.id.toLowerCase() === lead.stage.toLowerCase()
                );
                const displayStageName = stageObj ? stageObj.name : lead.stage;

                return (
                  <tr key={lead.id}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Select ${lead.name}`}
                        checked={selected.includes(lead.id)}
                        onChange={() => toggleSelection(lead.id)}
                      />
                    </td>

                    <td>
                      <button
                        className="bl-person"
                        onClick={() => setDraft({ ...lead })}
                      >
                        <div className="bl-person-avatar">
                          {lead.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <strong>{lead.name}</strong>
                            {lead.isConverted && (
                              <span
                                className="bl-tag-pill bl-converted-badge"
                                title="Converted to Contact & Company"
                              >
                                Converted
                              </span>
                            )}
                          </div>
                          <small>{lead.company || "No company"}</small>
                        </div>
                      </button>
                    </td>

                    <td>{lead.source}</td>

                    <td>
                      <span
                        className={`bl-status ${lead.stage.toLowerCase()}`}
                      >
                        {displayStageName}
                      </span>
                    </td>

                    <td>
                      <div className="bl-score">
                        <div className="bl-score-track">
                          <span style={{ width: `${lead.score}%` }} />
                        </div>
                        {lead.score}
                      </div>
                    </td>

                    <td>{money(lead.value)}</td>
                    <td>{lead.owner || "Unassigned"}</td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          justifyContent: "flex-end",
                        }}
                      >
                        {!lead.isConverted && (
                          <button
                            type="button"
                            className="bl-mini-convert-btn"
                            title="Convert lead into Contact, Company & Deal"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConvertTarget(lead);
                            }}
                          >
                            <UserCheck size={13} />
                            <span>Convert</span>
                          </button>
                        )}
                        <button
                          className="bl-icon"
                          aria-label={`Open ${lead.name}`}
                          onClick={() => setDraft({ ...lead })}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!filtered.length && (
            <div className="bl-empty">
              <UsersRound size={34} strokeWidth={1.3} />
              <h3>No matching leads</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </div>

        <div className="bl-table-footer">
          Showing {filtered.length} of {leads.length} leads
        </div>
      </article>

      {/* CONTEXTUAL RECORD DRAWER */}
      {draft && (
        <aside
          className="bl-drawer bl-record-drawer"
          role="dialog"
          aria-label="Lead profile"
        >
          <form onSubmit={saveLead}>
            <div className="bl-between">
              <div>
                <div className="bl-eyebrow">LEAD PROFILE</div>
                <h2>{draft.name || "New opportunity"}</h2>
                <p>{draft.company || "Lead information"}</p>
              </div>

              <button
                type="button"
                className="bl-icon"
                aria-label="Close lead"
                onClick={() => setDraft(null)}
              >
                <X size={22} />
              </button>
            </div>

            <div className="bl-insight">
              <Sparkles size={18} />
              <div>
                <strong>Lead priority</strong>
                <p>
                  {draft.score >= 80
                    ? "High intent — prioritize follow-up."
                    : draft.score >= 50
                    ? "Warm lead — continue nurturing."
                    : "Early-stage lead — qualify first."}
                </p>
              </div>
            </div>

            {draft.isConverted ? (
              <div
                className="bl-insight"
                style={{
                  borderColor: "rgba(16, 185, 129, 0.35)",
                  background: "rgba(16, 185, 129, 0.08)",
                  marginTop: "10px",
                }}
              >
                <CheckCircle2 size={18} color="#10B981" />
                <div>
                  <strong style={{ color: "#10B981" }}>Converted Lead</strong>
                  <p>
                    Graduated into Contact 360° and Company Intelligence.
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="bl-drawer-conversion-banner"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "rgba(255, 225, 59, 0.1)",
                  border: "1px solid rgba(255, 225, 59, 0.3)",
                  marginTop: "10px",
                }}
              >
                <div>
                  <strong style={{ fontSize: "13px", display: "block" }}>
                    Qualify & Convert
                  </strong>
                  <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                    Graduate into Contact, Company & Deal
                  </span>
                </div>
                <button
                  type="button"
                  className="bl-primary"
                  style={{
                    padding: "6px 12px",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => setConvertTarget(draft)}
                >
                  <UserCheck size={14} /> Convert
                </button>
              </div>
            )}

            <div className="bl-form-grid">
              {(
                [
                  ["name", "Full name"],
                  ["company", "Company"],
                  ["email", "Email"],
                  ["source", "Lead source"],
                ] as const
              ).map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    type={key === "email" ? "email" : "text"}
                    required={key === "name"}
                    value={draft[key]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        [key]: e.target.value,
                      })
                    }
                  />
                </label>
              ))}

              <label>
                Stage
                <select
                  value={draft.stage.toLowerCase()}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      stage: e.target.value,
                    })
                  }
                >
                  {stages.map((s) => (
                    <option key={s.id} value={s.id.toLowerCase()}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Owner
                <select
                  value={draft.owner}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      owner: e.target.value,
                    })
                  }
                >
                  <option value="">Unassigned</option>
                  {PIPELINE_OWNERS.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>

              <label>
                Deal value (INR)
                <input
                  type="number"
                  min="0"
                  value={draft.value}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      value: Math.max(0, Number(e.target.value)),
                    })
                  }
                />
              </label>

              <label>
                Lead score: {draft.score}/100
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={draft.score}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      score: Number(e.target.value),
                    })
                  }
                />
              </label>

              <label className="bl-full-field">
                Notes
                <textarea
                  rows={5}
                  value={draft.notes}
                  placeholder="Add context about this lead..."
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      notes: e.target.value,
                    })
                  }
                />
              </label>
            </div>

            <div className="bl-form-actions">
              <button
                type="button"
                className="bl-secondary"
                onClick={() => setDraft(null)}
              >
                Cancel
              </button>

              <button type="submit" className="bl-primary">
                Save lead <ArrowUpRight size={16} />
              </button>
            </div>
          </form>
        </aside>
      )}

      {/* Lead Conversion Modal */}
      <LeadConvertModal
        isOpen={Boolean(convertTarget)}
        onClose={() => setConvertTarget(null)}
        lead={convertTarget}
        contacts={contacts}
        companies={companies}
        stages={stages}
        onConvert={handlePerformConversion}
      />
    </section>
  );
}
