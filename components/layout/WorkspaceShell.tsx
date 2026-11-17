"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  UsersRound,
  Kanban,
  ContactRound,
  Inbox,
  CalendarDays,
  ChartNoAxesCombined,
  Workflow,
  Palette,
  Settings2,
  Sparkles,
  Bell,
  Zap,
  X,
  Check,
  RotateCcw,
} from "lucide-react";
import {
  palettes,
  useTheme,
  contrastColor,
} from "../theme/ThemeProvider";
import { BizLeadIcon } from "../brand/BizLeadIcon";
import { BizLeadLogo } from "../brand/BizLeadLogo";

const navigation = [
  { name: "Overview", route: "/dashboard", icon: LayoutDashboard, ready: true },
  { name: "Leads", route: "/leads", icon: UsersRound, ready: true },
  { name: "Pipeline", route: "/pipeline", icon: Kanban, ready: true },
  { name: "Contacts", route: "/contacts", icon: ContactRound, ready: false },
  { name: "Inbox", route: "/inbox", icon: Inbox, ready: false },
  { name: "Tasks", route: "/tasks", icon: CalendarDays, ready: false },
  { name: "Analytics", route: "/analytics", icon: ChartNoAxesCombined, ready: false },
  { name: "Automations", route: "/automations", icon: Workflow, ready: false },
];

export default function WorkspaceShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { openStudio, studioOpen } = useTheme();

  const current = navigation.find(
    (item) => pathname === item.route || pathname.startsWith(item.route + "/")
  );

  return (
    <>
      <aside className="bl-dock">
        <Link href="/dashboard" className="bl-logo-icon" title="BizLead Home">
          <BizLeadIcon
            size={28}
            barColor="#FFFFFF"
            gapColor="#0d0d0d"
            accentColor="var(--accent)"
          />
        </Link>

        <nav className="bl-navigation">
          {navigation.map(({ name, route, icon: Icon, ready }) => {
            const selected = current?.route === route;

            return ready ? (
              <Link
                key={route}
                href={route}
                aria-label={name}
                aria-current={selected ? "page" : undefined}
                title={name}
                className={`bl-nav-item ${selected ? "active" : ""}`}
              >
                <Icon size={21} strokeWidth={1.7} />
                <span className="bl-tooltip">{name}</span>
              </Link>
            ) : (
              <button
                key={route}
                disabled
                title={`${name} — coming soon`}
                className="bl-nav-item"
                aria-label={`${name} — coming soon`}
              >
                <Icon size={21} strokeWidth={1.7} />
              </button>
            );
          })}
        </nav>

        <div className="bl-dock-bottom">
          <button
            className="bl-nav-item"
            onClick={openStudio}
            title="Theme Studio"
            aria-label="Theme Studio"
          >
            <Palette size={21} />
          </button>

          <button
            className="bl-nav-item"
            disabled
            title="Settings — coming soon"
            aria-label="Settings"
          >
            <Settings2 size={21} />
          </button>

          <div className="bl-avatar">BL</div>
        </div>
      </aside>

      <main className="bl-main">
        <header className="bl-header">
          <div className="bl-brand-group">
            <Link
              href="/dashboard"
              style={{ textDecoration: "none" }}
              title="BizLead Dashboard"
            >
              <BizLeadLogo
                size="header"
                showIcon={false}
                tagline="The Intelligence Behind Growth."
              />
            </Link>

            <span className="bl-breadcrumb">
              Workspace / {current?.name ?? "Overview"}
            </span>
          </div>

          <div className="bl-header-actions">
            <button className="bl-secondary" onClick={openStudio}>
              <Palette size={16} /> Appearance
            </button>

            <button
              className="bl-accent"
              disabled
              title="AI integration coming soon"
            >
              <Sparkles size={16} /> Biz AI
            </button>

            <button
              className="bl-icon"
              disabled
              aria-label="Notifications"
            >
              <Bell size={19} />
            </button>
          </div>
        </header>

        {children}
      </main>

      {studioOpen && <ThemeStudio />}
    </>
  );
}

function ThemeStudio() {
  const {
    theme,
    draft,
    setDraft,
    livePreview,
    setLivePreview,
    cancel,
    apply,
    reset,
  } = useTheme();

  return (
    <aside
      className="bl-drawer bl-theme-studio"
      role="dialog"
      aria-label="Workspace appearance"
    >
      <div className="bl-between">
        <div>
          <div className="bl-eyebrow">PERSONALIZE</div>
          <h2>Theme Studio</h2>
          <p>Design your own workspace.</p>
        </div>

        <button
          className="bl-icon"
          onClick={cancel}
          aria-label="Close"
        >
          <X size={22} />
        </button>
      </div>

      <label className="bl-preview-toggle">
        <div>
          <strong>Live preview</strong>
          <small>Preview across the entire workspace.</small>
        </div>

        <input
          type="checkbox"
          checked={livePreview}
          onChange={(e) => setLivePreview(e.target.checked)}
        />
      </label>

      <div className="bl-eyebrow">PRESET PALETTES</div>

      <div className="bl-palettes">
        {palettes.map((palette) => (
          <button
            key={palette.name}
            className={`bl-palette ${
              draft.name === palette.name ? "chosen" : ""
            }`}
            onClick={() => setDraft({ ...palette })}
          >
            <div className="bl-swatches">
              {[
                palette.primary,
                palette.accent,
                palette.background,
                palette.surface,
              ].map((color, i) => (
                <span key={i} style={{ background: color }} />
              ))}
            </div>

            <div className="bl-between">
              {palette.name}
              {draft.name === palette.name && <Check size={14} />}
            </div>
          </button>
        ))}
      </div>

      <div className="bl-eyebrow">CUSTOM COLORS</div>

      {(
        [
          ["primary", "Primary"],
          ["accent", "Accent"],
          ["background", "Background"],
          ["surface", "Card surface"],
          ["text", "Text"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="bl-color-row">
          {label}

          <div>
            <code>{draft[key]}</code>
            <input
              type="color"
              value={draft[key]}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  name: "Custom",
                  [key]: e.target.value,
                })
              }
            />
          </div>
        </label>
      ))}

      <div className="bl-eyebrow" style={{ marginTop: 24 }}>
        THEME PREVIEW
      </div>

      <div
        className="bl-mini-preview"
        style={{
          background: draft.background,
          color: draft.text,
        }}
      >
        <div
          className="bl-mini-dock"
          style={{ background: draft.primary }}
        />

        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "8px",
            }}
          >
            <BizLeadIcon
              size={18}
              barColor={draft.text}
              gapColor={draft.background}
              accentColor={draft.accent}
            />
            <span
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 900,
                fontSize: "14px",
                letterSpacing: "-0.5px",
                textTransform: "uppercase",
              }}
            >
              <span style={{ color: draft.text }}>BIZ</span>
              <span style={{ color: draft.accent }}>LEAD</span>
            </span>
          </div>

          <div className="bl-mini-grid">
            <div
              style={{
                background: draft.primary,
                color: contrastColor(draft.primary),
              }}
            >
              Revenue
              <h3>₹24.86L</h3>
              <svg viewBox="0 0 120 30">
                <path
                  d="M0 28L20 20L40 23L60 12L80 17L100 5L120 0"
                  stroke={draft.accent}
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>

            <div
              style={{
                background: draft.accent,
                color: contrastColor(draft.accent),
              }}
            >
              AI insights
              <h3>12</h3>
            </div>
          </div>
        </div>
      </div>

      <p className="bl-muted">
        Current applied theme: {theme.name}
      </p>

      <div className="bl-theme-actions">
        <button className="bl-secondary" onClick={reset}>
          <RotateCcw size={14} /> Reset default
        </button>

        <button className="bl-secondary" onClick={cancel}>
          Cancel
        </button>

        <button className="bl-accent" onClick={apply}>
          <Check size={15} /> Apply
        </button>
      </div>
    </aside>
  );
}
