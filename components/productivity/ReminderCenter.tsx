"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Clock,
  Check,
  CheckCheck,
  X,
  Calendar,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { useCRM } from "../crm/CRMProvider";
import { CRMReminder } from "../crm/types";

interface ReminderCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReminderCenter({ isOpen, onClose }: ReminderCenterProps) {
  const {
    reminders,
    unreadRemindersCount,
    markReminderRead,
    markAllRemindersRead,
    dismissReminder,
    snoozeReminder,
    openTaskDrawer,
    openMeetingDrawer,
  } = useCRM();

  const [notificationPermission, setNotificationPermission] = useState<string>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === "granted") {
        new Notification("BizLead Notifications Enabled", {
          body: "You will receive desktop reminders for scheduled tasks and client meetings.",
        });
      }
    }
  };

  if (!isOpen) return null;

  const activeReminders = reminders.filter((r) => !r.isDismissed);

  const handleReminderClick = (r: CRMReminder) => {
    markReminderRead(r.id);
    if (r.entityType === "meeting") {
      openMeetingDrawer(r.entityId);
    } else {
      openTaskDrawer(r.entityId);
    }
    onClose();
  };

  return (
    <div className="bl-reminder-popover-backdrop" onClick={onClose}>
      <div
        className="bl-reminder-popover"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Reminders and notifications"
      >
        <div className="bl-reminder-header bl-between">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Bell size={16} />
            <strong style={{ fontSize: "14px" }}>Reminders & Alerts</strong>
            {unreadRemindersCount > 0 && (
              <span className="bl-badge-yellow">{unreadRemindersCount} new</span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {unreadRemindersCount > 0 && (
              <button
                type="button"
                className="bl-secondary bl-btn-xs"
                onClick={() => markAllRemindersRead()}
                title="Mark all as read"
              >
                <CheckCheck size={12} />
                <span>Mark All Read</span>
              </button>
            )}
            <button
              type="button"
              className="bl-icon-xs"
              onClick={onClose}
              aria-label="Close notifications"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Browser Notification Banner */}
        {notificationPermission === "default" && (
          <div className="bl-reminder-perm-banner bl-between">
            <div>
              <strong style={{ fontSize: "12px", display: "block" }}>
                Enable Desktop Alerts
              </strong>
              <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                Get notified when meetings or tasks are due
              </span>
            </div>
            <button
              type="button"
              className="bl-accent bl-btn-xs"
              onClick={handleRequestPermission}
            >
              Enable
            </button>
          </div>
        )}

        <div className="bl-reminder-list">
          {activeReminders.length === 0 ? (
            <div className="bl-reminder-empty">
              <Check size={24} style={{ color: "var(--muted)", margin: "0 auto 8px" }} />
              <p>You're all caught up!</p>
              <span>No pending notifications or due reminders.</span>
            </div>
          ) : (
            activeReminders.map((r) => (
              <div
                key={r.id}
                className={`bl-reminder-item ${r.isRead ? "read" : "unread"} ${
                  r.priority === "urgent" ? "urgent" : ""
                }`}
                onClick={() => handleReminderClick(r)}
              >
                <div className="bl-reminder-item-left">
                  <div
                    className={`bl-reminder-dot ${r.isRead ? "read" : "unread"}`}
                  />
                  <div>
                    <h5 className="bl-reminder-title">{r.title}</h5>
                    <p className="bl-reminder-message">{r.message}</p>
                    <span className="bl-reminder-time">
                      <Clock size={11} />
                      <span>{new Date(r.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  </div>
                </div>

                <div
                  className="bl-reminder-item-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="bl-reminder-btn snooze"
                    title="Snooze 30 minutes"
                    onClick={() => snoozeReminder(r.id, 30)}
                  >
                    +30m
                  </button>
                  <button
                    type="button"
                    className="bl-reminder-btn dismiss"
                    title="Dismiss"
                    onClick={() => dismissReminder(r.id)}
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
