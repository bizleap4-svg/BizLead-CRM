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
} from "lucide-react";

const stages = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Won",
  "Lost",
] as const;

type Stage = (typeof stages)[number];

type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  source: string;
  stage: Stage;
  score: number;
  owner: string;
  value: number;
  notes: string;
};

const initialLeads: Lead[] = [
  {
    id: "BL-001",
    name: "Aarav Sharma",
    company: "Layers Studio",
    email: "",
    source: "Meta Ads",
    stage: "Qualified",
    score: 96,
    owner: "Sales Executive A",
    value: 84000,
    notes: "Interested in website development.",
  },
  {
    id: "BL-002",
    name: "Ananya Patel",
    company: "Orbit Technologies",
    email: "",
    source: "Website",
    stage: "New",
    score: 88,
    owner: "Sales Executive B",
    value: 120000,
    notes: "",
  },
  {
    id: "BL-003",
    name: "Rohan Mehta",
    company: "Studio North",
    email: "",
    source: "WhatsApp",
    stage: "Contacted",
    score: 81,
    owner: "",
    value: 65000,
    notes: "",
  },
  {
    id: "BL-004",
    name: "Neha Gupta",
    company: "Forma Collective",
    email: "",
    source: "Instagram",
    stage: "Proposal",
    score: 74,
    owner: "Sales Executive A",
    value: 92000,
    notes: "",
  },
];

const owners = [
  "Sales Executive A",
  "Sales Executive B",
  "Sales Executive C",
];

function newLead(): Lead {
  return {
    id: crypto.randomUUID(),
    name: "",
    company: "",
    email: "",
    source: "Manual",
    stage: "New",
    score: 0,
    owner: "",
    value: 0,
    notes: "",
  };
}

const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default function LeadsPage() {
  const [leads, setLeads] = useState(initialLeads);
  const [query, setQuery] = useState("");
  const [view, setView] = useState("All leads");
  const [stage, setStage] = useState("All stages");
  const [source, setSource] = useState("All sources");
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [draft, setDraft] = useState<Lead | null>(null);

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

      return (
        matchesSearch &&
        matchesView &&
        (stage === "All stages" || lead.stage === stage) &&
        (source === "All sources" || lead.source === source)
      );
    });
  }, [leads, query, view, stage, source]);

  function saveLead(event: FormEvent) {
    event.preventDefault();
    if (!draft || !draft.name.trim()) return;

    const updated = {
      ...draft,
      name: draft.name.trim(),
    };

    setLeads((previous) =>
      previous.some((lead) => lead.id === updated.id)
        ? previous.map((lead) =>
            lead.id === updated.id ? updated : lead
          )
        : [updated, ...previous]
    );

    setDraft(null);
  }

  function toggleSelection(id: string) {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  }

  function assignSelected(owner: string) {
    setLeads((previous) =>
      previous.map((lead) =>
        selected.includes(lead.id)
          ? { ...lead, owner }
          : lead
      )
    );
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
    link.download = "bizlead-leads.csv";
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
          onClick={() => setDraft(newLead())}
        >
          <Plus size={18} /> Add lead
        </button>
      </div>

      <div className="bl-lead-metrics">
        {[
          ["All leads", leads.length],
          ["New leads", leads.filter(l => l.stage === "New").length],
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
              value={stage}
              onChange={(e) => setStage(e.target.value)}
            >
              <option>All stages</option>
              {stages.map(s => <option key={s}>{s}</option>)}
            </select>

            <select
              aria-label="Filter by source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option>All sources</option>
              {[...new Set(leads.map(l => l.source))].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <button
              className="bl-secondary"
              onClick={() => {
                setQuery("");
                setStage("All stages");
                setSource("All sources");
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
              {owners.map(o => <option key={o}>{o}</option>)}
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
                      filtered.every(l => selected.includes(l.id))
                    }
                    onChange={(e) =>
                      setSelected(previous =>
                        e.target.checked
                          ? [
                              ...new Set([
                                ...previous,
                                ...filtered.map(l => l.id),
                              ]),
                            ]
                          : previous.filter(
                              id => !filtered.some(l => l.id === id)
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
              {filtered.map((lead) => (
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
                        <strong>{lead.name}</strong>
                        <small>{lead.company || "No company"}</small>
                      </div>
                    </button>
                  </td>

                  <td>{lead.source}</td>

                  <td>
                    <span
                      className={`bl-status ${lead.stage.toLowerCase()}`}
                    >
                      {lead.stage}
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
                    <button
                      className="bl-icon"
                      aria-label={`Open ${lead.name}`}
                      onClick={() => setDraft({ ...lead })}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
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
                  value={draft.stage}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      stage: e.target.value as Stage,
                    })
                  }
                >
                  {stages.map(s => <option key={s}>{s}</option>)}
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
                  {owners.map(o => <option key={o}>{o}</option>)}
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
    </section>
  );
}
