"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { BizLeadLogo } from "@/components/brand/BizLeadLogo";
import { useCRM } from "@/components/crm/CRMProvider";
import { formatINR } from "@/components/crm/selectors";
import { Tabs } from "@/components/ui/Tabs";

export default function BizLeadDashboard() {
  const { leads, stages } = useCRM();
  const [activeTab, setActiveTab] = useState("Overview");

  const priorityDeals = [...leads]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 5);

  return (
    <>
      {/* INTRODUCTION */}
      <section className="intro">
        <div>
          <div className="eyebrow">INTELLIGENCE / OVERVIEW</div>
          <h1>Every lead. Every opportunity.</h1>
          <p>Your business, in focus.</p>
        </div>

        <div className="date-filter">
          Last 30 days
          <ChevronDown size={14} />
        </div>
      </section>

      <Tabs
        items={[
          { id: "Overview", label: "Overview" },
          { id: "Revenue", label: "Revenue" },
          { id: "Acquisition", label: "Acquisition" },
          { id: "Team", label: "Team" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        queryParamKey="tab"
        variant="underline"
        style={{ marginBottom: "20px" }}
      />

      {/* BENTO DASHBOARD */}
      <section className="dashboard-grid">
        {/* REVENUE INTELLIGENCE */}
        <article className="revenue-card">
          <div className="card-top">
            <span className="eyebrow">REVENUE INTELLIGENCE</span>
            <span className="dark-pill">
              Monthly <ChevronDown size={12} />
            </span>
          </div>

          <div className="revenue-heading">
            <h2>₹24.86L</h2>
            <span className="growth-pill">
              <ArrowUpRight size={15} />
              24.8%
            </span>
          </div>

          <p>Revenue compared to the previous month</p>

          <svg
            className="revenue-chart"
            viewBox="0 0 680 205"
            role="img"
            aria-label="Illustrative revenue growth chart"
          >
            <defs>
              <linearGradient
                id="revenueGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--accent)"
                  stopOpacity=".23"
                />
                <stop
                  offset="100%"
                  stopColor="var(--accent)"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            {[35, 85, 135, 185].map((y, i) => (
              <g key={y}>
                <text
                  x="0"
                  y={y + 3}
                  className="chart-label"
                >
                  {["₹30L", "₹20L", "₹10L", "₹0"][i]}
                </text>

                <line
                  x1="45"
                  x2="670"
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  opacity=".13"
                  strokeDasharray="4 6"
                />
              </g>
            ))}

            <path
              d="M45 170
                 C90 165 105 140 145 148
                 S210 154 245 115
                 S310 128 345 100
                 S410 110 445 70
                 S510 90 545 50
                 S620 45 670 18
                 L670 185 L45 185 Z"
              fill="url(#revenueGradient)"
            />

            <path
              d="M45 170
                 C90 165 105 140 145 148
                 S210 154 245 115
                 S310 128 345 100
                 S410 110 445 70
                 S510 90 545 50
                 S620 45 670 18"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <path
              d="M45 185
                 Q100 160 145 170
                 T245 150
                 T345 145
                 T445 125
                 T545 115
                 T670 92"
              stroke="currentColor"
              opacity=".35"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              fill="none"
            />

            <circle
              cx="545"
              cy="50"
              r="5"
              fill="var(--accent)"
            />

            {["Nov 1", "Nov 5", "Nov 10",
              "Nov 15", "Nov 20", "Nov 30"
            ].map((date, i) => (
              <text
                key={date}
                x={45 + i * 119}
                y="203"
                className="chart-label"
              >
                {date}
              </text>
            ))}
          </svg>
        </article>

        {/* AI BRIEFING */}
        <article className="ai-card">
          <div className="eyebrow ai-label">
            <Sparkles size={16} />
            BIZ AI / DAILY BRIEFING
          </div>

          <h2>12 opportunities need you.</h2>
          <p>Discover your highest-intent leads.</p>

          <Link href="/leads" className="text-link" style={{ textDecoration: "none", color: "inherit" }}>
            Review priority leads <ArrowUpRight size={15} />
          </Link>

          <svg
            viewBox="0 0 110 110"
            className="ai-orb"
            aria-hidden="true"
          >
            {Array.from({ length: 18 }, (_, i) => (
              <ellipse
                key={i}
                cx="55"
                cy="55"
                rx="48"
                ry="15"
                fill="none"
                stroke="currentColor"
                strokeWidth=".75"
                transform={`rotate(${i * 10} 55 55)`}
              />
            ))}
          </svg>
        </article>

        {/* ACTIVE OPPORTUNITIES */}
        <article className="metric-card">
          <p className="metric-label">
            Active opportunities
          </p>

          <div className="metric-value">
            148
            <span className="positive">↗ 18%</span>
          </div>

          <div className="mini-bars">
            {[22, 35, 28, 48, 37, 55, 44,
              68, 52, 77, 65, 88, 79
            ].map((value, i) => (
              <div
                key={i}
                style={{
                  height: `${value}%`,
                  background:
                    i > 8
                      ? "var(--accent)"
                      : "var(--soft-neutral)",
                }}
              />
            ))}
          </div>
        </article>

        {/* CONVERSION RATE */}
        <article className="metric-card conversion-card">
          <p className="metric-label">Conversion rate</p>

          <svg viewBox="0 0 180 125" className="gauge">
            {Array.from({ length: 40 }, (_, i) => {
              const angle =
                (150 + i * (240 / 39)) * Math.PI / 180;

              return (
                <line
                  key={i}
                  x1={Number((90 + Math.cos(angle) * 43).toFixed(2))}
                  y1={Number((70 + Math.sin(angle) * 43).toFixed(2))}
                  x2={Number((90 + Math.cos(angle) * 54).toFixed(2))}
                  y2={Number((70 + Math.sin(angle) * 54).toFixed(2))}
                  stroke={
                    i < 13
                      ? "var(--primary)"
                      : "var(--soft-neutral)"
                  }
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              );
            })}

            <text
              x="90"
              y="72"
              textAnchor="middle"
              className="gauge-value"
            >
              32.8%
            </text>

            <text
              x="90"
              y="91"
              textAnchor="middle"
              className="gauge-growth"
            >
              +4.2% this month
            </text>
          </svg>
        </article>

        {/* PRIORITY WORKSPACE */}
        <article className="priority-card">
          <div className="section-heading">
            <div>
              <h3>Priority workspace</h3>
              <p>Focus on the deals that matter most.</p>
            </div>

            <Link href="/pipeline" className="subtle-pill" style={{ textDecoration: "none", color: "inherit" }}>
              Open Pipeline <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Value</th>
                  <th>Lead score</th>
                  <th>Next action</th>
                </tr>
              </thead>

              <tbody>
                {priorityDeals.map((deal) => (
                  <tr key={deal.id}>
                    <td>
                      <div className="lead-company">
                        <div className="company-icon">
                          {deal.company.slice(0, 2).toUpperCase()}
                        </div>

                        <div>
                          <strong>{deal.company}</strong>
                          <small>{deal.source} · {deal.name}</small>
                        </div>
                      </div>
                    </td>

                    <td className="deal-value">
                      {formatINR(deal.value)}
                    </td>

                    <td>
                      <div className="score">
                        <div className="score-track">
                          <div
                            style={{
                              width: `${deal.score}%`,
                            }}
                          />
                        </div>

                        {deal.score}
                      </div>
                    </td>

                    <td>
                      <span className="action-pill">
                        {deal.nextFollowUp || "Review opportunity"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        {/* PIPELINE FLOW */}
        <article className="pipeline-card">
          <Link
            href="/pipeline"
            className="section-heading"
            style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
            title="Open Pipeline Studio"
          >
            <div>
              <h3>Pipeline flow</h3>
              <p>From first touch to closed deal.</p>
            </div>

            <ArrowUpRight size={19} />
          </Link>

          <div className="pipeline-bars">
            {stages.slice(0, 5).map((stage, i) => {
              const count = leads.filter(
                (l) => l.stage.toLowerCase() === stage.id.toLowerCase()
              ).length;
              // Add baseline funnel display for visual clarity
              const displayVal = count > 0 ? count : (5 - i);

              return (
                <div className="pipeline-column" key={stage.id}>
                  <div className="pipeline-track">
                    <div
                      className="pipeline-fill"
                      style={{
                        height: `${Math.max(25, (displayVal / 5) * 100)}%`,
                        background:
                          i === 3
                            ? "var(--accent)"
                            : `color-mix(in srgb,
                                var(--primary) ${20 + i * 20}%,
                                var(--surface))`,
                        color:
                          i === 3
                            ? "var(--on-accent)"
                            : i >= 2
                            ? "var(--on-primary)"
                            : "var(--text)",
                      }}
                    >
                      {count}
                    </div>
                  </div>

                  <span>{stage.name}</span>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <footer className="dashboard-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <BizLeadLogo size="sm" />
        <span>Demo workspace · Illustrative data</span>
      </footer>
    </>
  );
}
