"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  icon?: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  badge?: string;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  queryParamKey?: string;
  variant?: "underline" | "pills" | "nested";
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeTab,
  onChange,
  queryParamKey,
  variant = "underline",
  size = "md",
  className = "",
  style = {},
  ariaLabel = "Navigation Tabs",
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  // Sync with URL query parameter on mount if provided
  useEffect(() => {
    if (!queryParamKey || !searchParams) return;
    const paramVal = searchParams.get(queryParamKey);
    if (paramVal && items.some((item) => item.id.toLowerCase() === paramVal.toLowerCase())) {
      const match = items.find((item) => item.id.toLowerCase() === paramVal.toLowerCase());
      if (match && match.id !== activeTab) {
        onChange(match.id);
      }
    }
  }, [queryParamKey, searchParams, items]);

  // Update URL when tab changes
  const handleSelect = useCallback(
    (tabId: string) => {
      onChange(tabId);
      if (queryParamKey && typeof window !== "undefined") {
        try {
          const url = new URL(window.location.href);
          url.searchParams.set(queryParamKey, tabId);
          window.history.replaceState(null, "", url.toString());
        } catch {
          // fallback if URL parsing fails
        }
      }
    },
    [onChange, queryParamKey]
  );

  // Check scroll position to update fade masks
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const canScrollLeft = el.scrollLeft > 2;
    const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 2;
    setShowLeftFade(canScrollLeft);
    setShowRightFade(canScrollRight);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, items]);

  // Keyboard navigation across tabs
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIdx = (index + 1) % items.length;
      handleSelect(items[nextIdx].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIdx = (index - 1 + items.length) % items.length;
      handleSelect(items[prevIdx].id);
    }
  };

  // Styling maps based on variant and size
  const getContainerClasses = () => {
    const base = "bl-tabs-container";
    const variantClass = `bl-tabs-${variant}`;
    const sizeClass = `bl-tabs-${size}`;
    return `${base} ${variantClass} ${sizeClass} ${className}`.trim();
  };

  return (
    <div
      className={getContainerClasses()}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        width: "100%",
        maxWidth: "100%",
        ...style,
      }}
    >
      {/* Left Scroll Fade Overlay */}
      {showLeftFade && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "28px",
            background: "linear-gradient(to right, var(--surface, #ffffff), transparent)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      )}

      {/* Scrollable Tabs Track */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        role="tablist"
        aria-label={ariaLabel}
        style={{
          display: "flex",
          alignItems: "center",
          gap: variant === "underline" ? "24px" : variant === "nested" ? "6px" : "8px",
          overflowX: "auto",
          overflowY: "hidden",
          whiteSpace: "nowrap",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          width: "100%",
          padding: variant === "nested" ? "4px" : variant === "pills" ? "4px 8px" : "0 4px",
          borderBottom: variant === "underline" ? "1px solid var(--border)" : "none",
          backgroundColor: variant === "nested" ? "var(--soft-neutral)" : "transparent",
          borderRadius: variant === "nested" ? "10px" : variant === "pills" ? "12px" : "0",
        }}
      >
        {items.map((item, index) => {
          const isActive = activeTab.toLowerCase() === item.id.toLowerCase();
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${item.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={item.disabled}
              onClick={() => handleSelect(item.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`bl-tab-btn ${isActive ? "active" : ""} ${variant}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                flexShrink: 0,
                whiteSpace: "nowrap",
                cursor: item.disabled ? "not-allowed" : "pointer",
                border: "none",
                background:
                  variant === "pills"
                    ? isActive
                      ? "var(--primary)"
                      : "transparent"
                    : variant === "nested"
                    ? isActive
                      ? "var(--surface)"
                      : "transparent"
                    : "transparent",
                color:
                  variant === "pills"
                    ? isActive
                      ? "var(--on-primary)"
                      : "var(--muted)"
                    : isActive
                    ? "var(--text)"
                    : "var(--muted)",
                fontWeight: isActive ? 700 : 500,
                fontSize: size === "sm" || variant === "nested" ? "12px" : "13px",
                padding:
                  variant === "underline"
                    ? "12px 2px"
                    : variant === "nested"
                    ? "6px 12px"
                    : "7px 14px",
                borderRadius: variant === "pills" ? "8px" : variant === "nested" ? "7px" : "0",
                boxShadow:
                  variant === "nested" && isActive
                    ? "0 1px 4px rgba(0,0,0,0.08)"
                    : "none",
                borderBottom:
                  variant === "underline"
                    ? isActive
                      ? "2px solid var(--text)"
                      : "2px solid transparent"
                    : "none",
                transition: "all 150ms ease",
                opacity: item.disabled ? 0.4 : 1,
              }}
            >
              {Icon && <Icon size={size === "sm" || variant === "nested" ? 14 : 16} />}
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: "999px",
                    backgroundColor:
                      isActive && variant === "pills"
                        ? "rgba(255,255,255,0.2)"
                        : "var(--soft-neutral)",
                    color:
                      isActive && variant === "pills"
                        ? "var(--on-primary)"
                        : "var(--text)",
                  }}
                >
                  {item.count}
                </span>
              )}
              {item.badge && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    padding: "1px 5px",
                    borderRadius: "4px",
                    backgroundColor: "var(--accent)",
                    color: "var(--on-accent)",
                    letterSpacing: "0.5px",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Scroll Fade Overlay */}
      {showRightFade && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "28px",
            background: "linear-gradient(to left, var(--surface, #ffffff), transparent)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      )}
    </div>
  );
};
