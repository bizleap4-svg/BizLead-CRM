"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { BizLeadLogo } from "@/components/brand/BizLeadLogo";

const leads = [
  {
    name: "Layers Studio",
    source: "Meta Ads",
    value: "₹84,000",
    score: 96,
    action: "Schedule call",
    initials: "LS",
  },
  {
    name: "Orbit Technologies",
    source: "Website",
    value: "₹1,20,000",
    score: 88,
    action: "Send proposal",
    initials: "OT",
  },
  {
    name: "Studio North",
    source: "WhatsApp",
    value: "₹65,000",
    score: 81,
    action: "Follow up",
    initials: "SN",
  },
  {
    name: "Forma Collective",
    source: "Referral",
    value: "₹92,000",
    score: 74,
    action: "Qualify lead",
    initials: "FC",
  },
];

export default function BizLeadDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");

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

      <div className="tabs">
        {["Overview", "Revenue", "Acquisition", "Team"].map((t) => (
          <span
            key={t}
            className={activeTab === t ? "selected" : ""}
            onClick={() => setActiveTab(t)}
            style={{ cursor: "pointer" }}
          >
            {t}
          </span>
        ))}
      </div>

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
                  x1={90 + Math.cos(angle) * 43}
                  y1={70 + Math.sin(angle) * 43}
                  x2={90 + Math.cos(angle) * 54}
                  y2={70 + Math.sin(angle) * 54}
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

            <Link href="/leads" className="subtle-pill" style={{ textDecoration: "none", color: "inherit" }}>
              All leads <ArrowUpRight size={13} />
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
                {leads.map((lead) => (
                  <tr key={lead.name}>
                    <td>
                      <div className="lead-company">
                        <div className="company-icon">
                          {lead.initials}
                        </div>

                        <div>
                          <strong>{lead.name}</strong>
                          <small>{lead.source}</small>
                        </div>
                      </div>
                    </td>

                    <td className="deal-value">
                      {lead.value}
                    </td>

                    <td>
                      <div className="score">
                        <div className="score-track">
                          <div
                            style={{
                              width: `${lead.score}%`,
                            }}
                          />
                        </div>

                        {lead.score}
                      </div>
                    </td>

                    <td>
                      <span className="action-pill">
                        {lead.action}
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
          <div className="section-heading">
            <div>
              <h3>Pipeline flow</h3>
              <p>From first touch to closed deal.</p>
            </div>

            <ArrowUpRight size={19} />
          </div>

          <div className="pipeline-bars">
            {[
              { name: "New", value: 248 },
              { name: "Contacted", value: 182 },
              { name: "Qualified", value: 96 },
              { name: "Proposal", value: 58 },
              { name: "Won", value: 42 },
            ].map((stage, i) => (
              <div className="pipeline-column" key={stage.name}>
                <div className="pipeline-track">
                  <div
                    className="pipeline-fill"
                    style={{
                      height: `${stage.value / 248 * 100}%`,
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
                    {stage.value}
                  </div>
                </div>

                <span>{stage.name}</span>
              </div>
            ))}
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
