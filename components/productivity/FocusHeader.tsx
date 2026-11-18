"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  CalendarDays,
  Video,
  Plus,
  CalendarPlus,
  RefreshCw,
  Download,
} from "lucide-react";
import { useCRM } from "../crm/CRMProvider";
import { ExternalSyncModal } from "./ExternalSyncModal";
import { useControlCenter } from "../settings/ControlCenterContext";

export function FocusHeader() {
  const pathname = usePathname();
  const { openTaskDrawer, openMeetingDrawer } = useCRM();
  const { canCreate } = useControlCenter();
  const [showSyncModal, setShowSyncModal] = useState(false);

  const tabs = [
    { name: "Focus Center", href: "/tasks", icon: CheckSquare },
    { name: "Calendar Studio", href: "/calendar", icon: CalendarDays },
    { name: "Meeting Workspace", href: "/meetings", icon: Video },
  ];

  return (
    <>
      <div className="bl-focus-header">
        <div className="bl-focus-tabs" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                role="tab"
                aria-selected={isActive}
                className={`bl-focus-tab ${isActive ? "active" : ""}`}
              >
                <Icon size={16} />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="bl-focus-header-actions">
          <button
            type="button"
            className="bl-secondary bl-btn-sm"
            onClick={() => setShowSyncModal(true)}
            title="External Calendar Sync & RFC 5545 Export"
          >
            <Download size={14} />
            <span>Sync / Export</span>
          </button>

          {canCreate("meetings") && (
            <button
              type="button"
              className="bl-secondary bl-btn-sm"
              onClick={() => openMeetingDrawer()}
              title="Schedule a new client consultation or demo"
            >
              <CalendarPlus size={14} />
              <span>Schedule Meeting</span>
            </button>
          )}

          {canCreate("tasks") && (
            <button
              type="button"
              className="bl-accent bl-btn-sm bl-primary-btn"
              onClick={() => openTaskDrawer()}
              title="Create a new task or follow-up item"
            >
              <Plus size={15} />
              <span>New Task</span>
            </button>
          )}
        </div>
      </div>

      {showSyncModal && (
        <ExternalSyncModal onClose={() => setShowSyncModal(false)} />
      )}
    </>
  );
}
