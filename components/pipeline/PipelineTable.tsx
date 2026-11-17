"use client";

import React from "react";
import { ChevronRight, Calendar, User, Flame } from "lucide-react";
import { Lead, PipelineStage } from "@/components/crm/types";
import { formatINR } from "@/components/crm/selectors";

interface PipelineTableProps {
  deals: Lead[];
  stages: PipelineStage[];
  onOpenDrawer: (id: string) => void;
  onMoveStage: (id: string, stageId: string) => void;
}

export function PipelineTable({
  deals,
  stages,
  onOpenDrawer,
  onMoveStage,
}: PipelineTableProps) {
  const getStageName = (stageId: string) => {
    return (
      stages.find((s) => s.id.toLowerCase() === stageId.toLowerCase())?.name ||
      stageId
    );
  };

  return (
    <div className="bl-table-panel bl-pipeline-table-panel">
      <div className="bl-table-scroll">
        <table className="bl-data-table">
          <thead>
            <tr>
              <th>Opportunity / Company</th>
              <th>Contact Person</th>
              <th>Stage</th>
              <th>Deal Value</th>
              <th>Win Probability</th>
              <th>Weighted Value</th>
              <th>Close Date</th>
              <th>Priority</th>
              <th>Owner</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => {
              const weighted = deal.value * ((deal.probability || 0) / 100);
              const priorityClass =
                deal.priority === "high"
                  ? "bl-priority-high"
                  : deal.priority === "medium"
                  ? "bl-priority-medium"
                  : "bl-priority-low";

              return (
                <tr
                  key={deal.id}
                  onClick={() => onOpenDrawer(deal.id)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <div className="bl-person">
                      <div className="bl-person-avatar">
                        {deal.company.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <strong>{deal.company}</strong>
                        <small>{deal.source}</small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div>
                      <strong>{deal.name}</strong>
                      <small style={{ color: "var(--muted)", display: "block" }}>
                        {deal.email || "No email"}
                      </small>
                    </div>
                  </td>

                  <td>
                    <select
                      value={deal.stage.toLowerCase()}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onMoveStage(deal.id, e.target.value)}
                      className="bl-table-stage-select"
                      aria-label="Change stage"
                    >
                      {stages.map((st) => (
                        <option key={st.id} value={st.id.toLowerCase()}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td style={{ fontWeight: 600 }}>{formatINR(deal.value)}</td>

                  <td>
                    <div className="bl-score">
                      <div className="bl-score-track">
                        <span style={{ width: `${deal.probability}%` }} />
                      </div>
                      {deal.probability}%
                    </div>
                  </td>

                  <td style={{ color: "var(--accent)", fontWeight: 600 }}>
                    {formatINR(weighted)}
                  </td>

                  <td>
                    <span className="bl-date-cell">
                      <Calendar size={12} /> {deal.expectedCloseDate || "-"}
                    </span>
                  </td>

                  <td>
                    <span className={`bl-deal-priority-pill ${priorityClass}`}>
                      {deal.priority || "medium"}
                    </span>
                  </td>

                  <td>{deal.owner || "Unassigned"}</td>

                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="bl-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDrawer(deal.id);
                      }}
                      title="Open deal details"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {deals.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "40px" }}>
                  <div className="bl-empty">
                    <h3>No matching deals found</h3>
                    <p>Try resetting your search or stage filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bl-table-footer">
        Showing {deals.length} deals in pipeline view
      </div>
    </div>
  );
}

export default PipelineTable;
