"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  LayoutDashboard,
  UsersRound,
  Kanban,
  ContactRound,
  Inbox,
  Video,
  ChartNoAxesCombined,
  Palette,
  Settings2,
  Sparkles,
  Bell,
  PanelLeftOpen,
  PanelLeftClose,
  ChevronRight,
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
import { useCRM } from "../crm/CRMProvider";
import { ReminderCenter } from "../productivity/ReminderCenter";
import { CampaignDrawer } from "../marketing/CampaignDrawer";
import { GlobalAssistant } from "../ai/GlobalAssistant";
import { useControlCenter } from "../settings/ControlCenterContext";
import { useGlobalAI } from "../ai/GlobalAIContext";

const navigation: Array<{
  name: string;
  route: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  ready: boolean;
  desc: string;
}> = [
  { name: "Overview", route: "/dashboard", icon: LayoutDashboard, ready: true, desc: "Executive business & revenue metrics" },
  { name: "Leads", route: "/leads", icon: UsersRound, ready: true, desc: "Capture, qualify & convert prospects" },
  { name: "Pipeline", route: "/pipeline", icon: Kanban, ready: true, desc: "Visual deal stages & velocity" },
  { name: "Contacts", route: "/contacts", icon: ContactRound, ready: true, desc: "Unified customer & relationship 360" },
  { name: "Inbox", route: "/inbox", icon: Inbox, ready: true, desc: "Omnichannel customer conversations" },
  { name: "Meetings", route: "/meetings", icon: Video, ready: true, desc: "Client calls, prep briefs & outcomes" },
  { name: "Analytics", route: "/analytics", icon: ChartNoAxesCombined, ready: true, desc: "Attribution, funnels & conversion" },
  { name: "Biz AI", route: "/ai", icon: Sparkles, ready: true, desc: "Autonomous CRM intelligence & actions" },
];

interface MagneticHoverTarget {
  name: string;
  desc?: string;
  route?: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  rect: DOMRect;
  selected: boolean;
  action?: () => void;
}

export default function WorkspaceShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { openStudio, studioOpen } = useTheme();
  const {
    unreadRemindersCount,
    isCampaignDrawerOpen,
    campaignDrawerCampaignId,
    closeCampaignDrawer,
  } = useCRM();
  const { activeMember, activeRole } = useControlCenter();
  const { isAIOpen } = useGlobalAI();
  const [reminderOpen, setReminderOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoverTarget, setHoverTarget] = useState<MagneticHoverTarget | null>(null);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("bizlead_sidebar_expanded");
      if (saved === "true") {
        setIsExpanded(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("bizlead_sidebar_expanded", String(next));
      } catch {
        // ignore
      }
      setHoverTarget(null);
      return next;
    });
  }, []);

  const current = navigation.find(
    (item) => pathname === item.route || pathname.startsWith(item.route + "/")
  );

  const handleMouseEnterItem = (
    item: { name: string; desc?: string; route?: string; icon: any },
    element: HTMLElement,
    action?: () => void
  ) => {
    if (isExpanded) return;
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    const rect = element.getBoundingClientRect();
    const isSelected = item.route ? (current?.route === item.route || pathname.startsWith(item.route + "/")) : false;
    setHoverTarget({
      name: item.name,
      desc: item.desc,
      route: item.route,
      icon: item.icon,
      rect,
      selected: isSelected,
      action,
    });
  };

  const handleMouseLeaveItem = () => {
    leaveTimerRef.current = setTimeout(() => {
      setHoverTarget(null);
    }, 120);
  };

  return (
    <>
      <aside className={`bl-dock ${isExpanded ? "bl-dock-expanded" : ""}`}>
        <Link href="/dashboard" className="bl-logo-icon" title="BizLead Home">
          <BizLeadIcon
            size={28}
            barColor="#FFFFFF"
            gapColor="#0d0d0d"
            accentColor="var(--accent)"
          />
        </Link>

        <nav className="bl-navigation">
          {navigation.map(({ name, route, icon: Icon, ready, desc }) => {
            const selected = current?.route === route || pathname.startsWith(route + "/");

            return ready ? (
              <Link
                key={route}
                href={route}
                aria-label={name}
                aria-current={selected ? "page" : undefined}
                className={`bl-nav-item ${selected ? "active" : ""}`}
                onMouseEnter={(e) =>
                  handleMouseEnterItem(
                    { name, desc, route, icon: Icon },
                    e.currentTarget
                  )
                }
                onMouseLeave={handleMouseLeaveItem}
              >
                <Icon size={20} strokeWidth={selected ? 2.2 : 1.7} className="bl-nav-item-icon" />
                {isExpanded && <span className="bl-nav-item-label">{name}</span>}
              </Link>
            ) : (
              <button
                key={route}
                disabled
                className="bl-nav-item"
                aria-label={`${name} — coming soon`}
              >
                <Icon size={20} strokeWidth={1.7} className="bl-nav-item-icon" />
                {isExpanded && <span className="bl-nav-item-label">{name}</span>}
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
            onMouseEnter={(e) =>
              handleMouseEnterItem(
                {
                  name: "Theme Studio",
                  desc: "Personalize workspace appearance",
                  icon: Palette,
                },
                e.currentTarget,
                openStudio
              )
            }
            onMouseLeave={handleMouseLeaveItem}
          >
            <Palette size={20} strokeWidth={1.7} className="bl-nav-item-icon" />
            {isExpanded && <span className="bl-nav-item-label">Appearance</span>}
          </button>

          <Link
            href="/settings"
            className={`bl-nav-item ${pathname.startsWith("/settings") ? "active" : ""}`}
            title="Control Center & Settings"
            aria-label="Control Center"
            onMouseEnter={(e) =>
              handleMouseEnterItem(
                {
                  name: "Control Center",
                  desc: "Teams, roles, permissions & org",
                  icon: Settings2,
                  route: "/settings",
                },
                e.currentTarget
              )
            }
            onMouseLeave={handleMouseLeaveItem}
          >
            <Settings2 size={20} strokeWidth={1.7} className="bl-nav-item-icon" />
            {isExpanded && <span className="bl-nav-item-label">Control Center</span>}
          </Link>

          {/* Dedicated Expand / Collapse Control Above Profile */}
          <button
            type="button"
            className="bl-nav-item bl-sidebar-toggle-btn"
            onClick={toggleSidebar}
            title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            aria-expanded={isExpanded}
            onMouseEnter={(e) =>
              !isExpanded &&
              handleMouseEnterItem(
                {
                  name: "Expand Sidebar",
                  desc: "Expand sidebar navigation (240px)",
                  icon: PanelLeftOpen,
                },
                e.currentTarget,
                toggleSidebar
              )
            }
            onMouseLeave={handleMouseLeaveItem}
          >
            {isExpanded ? (
              <>
                <PanelLeftClose size={20} strokeWidth={1.7} className="bl-nav-item-icon" />
                <span className="bl-nav-item-label">Collapse</span>
              </>
            ) : (
              <PanelLeftOpen size={20} strokeWidth={1.7} className="bl-nav-item-icon" />
            )}
          </button>

          {/* User Profile */}
          {isExpanded ? (
            <Link
              href="/settings?tab=preferences"
              className="bl-user-profile-row"
              title={`Active User: ${activeMember.name} (${activeRole.name})`}
            >
              <div className="bl-avatar">{activeMember.avatar}</div>
              <div className="bl-user-profile-info">
                <span className="bl-user-profile-name">{activeMember.name}</span>
                <span
                  className="bl-user-profile-role"
                  style={{ color: activeRole.color || "var(--accent)" }}
                >
                  {activeRole.name}
                </span>
              </div>
            </Link>
          ) : (
            <Link
              href="/settings?tab=preferences"
              className="bl-avatar"
              title={`Active User: ${activeMember.name} (${activeRole.name})`}
              style={{ textDecoration: "none" }}
            >
              {activeMember.avatar}
            </Link>
          )}
        </div>
      </aside>

      {/* Floating Magnetic Glass Reveal Portal (Active only when collapsed and hovered) */}
      {mounted && hoverTarget && !isExpanded && typeof document !== "undefined" &&
        createPortal(
          <MagneticGlassReveal
            target={hoverTarget}
            onClose={() => setHoverTarget(null)}
            onKeepAlive={() => {
              if (leaveTimerRef.current) {
                clearTimeout(leaveTimerRef.current);
                leaveTimerRef.current = null;
              }
            }}
          />,
          document.body
        )
      }

      <main className={`bl-main ${isExpanded ? "bl-main-sidebar-expanded" : ""} ${isAIOpen ? "bl-main-ai-open" : ""}`}>
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
              Workspace / {pathname.startsWith("/settings") ? "Control Center" : (current?.name ?? "Overview")}
            </span>
          </div>

          <div className="bl-header-actions">
            <Link
              href="/settings"
              className="bl-role-header-pill"
              title={`Active Testing Role: ${activeMember.name} (${activeRole.name})`}
            >
              <span className="bl-role-pill-avatar">{activeMember.avatar}</span>
              <span className="bl-role-pill-text">{activeMember.name}</span>
              <span className="bl-role-pill-role" style={{ color: activeRole.color || "var(--accent)" }}>
                {activeRole.name}
              </span>
            </Link>

            <button className="bl-secondary" onClick={openStudio}>
              <Palette size={16} /> Appearance
            </button>

            <Link
              href="/ai"
              className="bl-accent"
              style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
              title="Open Biz AI Workspace"
            >
              <Sparkles size={16} /> Biz AI
            </Link>

            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="bl-icon"
                onClick={() => setReminderOpen(!reminderOpen)}
                aria-label="Notifications"
                title="Reminders & Notifications"
                style={{ position: "relative" }}
              >
                <Bell size={19} />
                {unreadRemindersCount > 0 && (
                  <span className="bl-dock-unread-badge">
                    {unreadRemindersCount}
                  </span>
                )}
              </button>
              <ReminderCenter
                isOpen={reminderOpen}
                onClose={() => setReminderOpen(false)}
              />
            </div>
          </div>
        </header>

        {children}
      </main>

      {isCampaignDrawerOpen && (
        <CampaignDrawer
          isOpen={isCampaignDrawerOpen}
          onClose={closeCampaignDrawer}
          campaignId={campaignDrawerCampaignId}
        />
      )}

      {studioOpen && <ThemeStudio />}

      <GlobalAssistant />
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

function MagneticGlassReveal({
  target,
  onClose,
  onKeepAlive,
}: {
  target: MagneticHoverTarget;
  onClose: () => void;
  onKeepAlive: () => void;
}) {
  const [mousePos, setMousePos] = useState({ x: 40, y: 22 });
  const [isClosing, setIsClosing] = useState(false);
  const Icon = target.icon;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const x = e.clientX - target.rect.left;
    const y = e.clientY - target.rect.top;
    setMousePos({ x, y });
  };

  const handleLeave = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 180);
  };

  const handleClick = () => {
    if (target.action) {
      target.action();
    }
    onClose();
  };

  const pillContent = (
    <div
      className={`bl-magnetic-pill ${target.selected ? "active" : ""}`}
      style={{
        "--mouse-x": `${mousePos.x}px`,
        "--mouse-y": `${mousePos.y}px`,
      } as React.CSSProperties}
      onClick={handleClick}
    >
      {/* Originating Connected Icon Area */}
      <div className={`bl-magnetic-icon-box ${target.selected ? "active" : ""}`}>
        <Icon size={20} strokeWidth={target.selected ? 2.2 : 1.8} />
      </div>

      {/* Subtle Yellow Accent Line */}
      <div className="bl-magnetic-accent-line" />

      {/* Module Title & Description */}
      <div className="bl-magnetic-content">
        <span className="bl-magnetic-title">{target.name}</span>
        {target.desc && <span className="bl-magnetic-desc">{target.desc}</span>}
      </div>

      {/* Small Directional Arrow */}
      <div className="bl-magnetic-arrow">
        <ChevronRight size={14} strokeWidth={2.2} />
      </div>
    </div>
  );

  return (
    <div
      className={`bl-magnetic-portal ${isClosing ? "bl-closing" : ""}`}
      style={{
        top: Math.round(target.rect.top - 2),
        left: Math.round(target.rect.left - 2),
      }}
      onMouseEnter={onKeepAlive}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
    >
      {target.route ? (
        <Link
          href={target.route}
          style={{ textDecoration: "none", color: "inherit", display: "block" }}
          onClick={handleClick}
        >
          {pillContent}
        </Link>
      ) : (
        pillContent
      )}
    </div>
  );
}
