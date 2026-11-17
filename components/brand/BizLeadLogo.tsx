"use client";

import React from "react";
import { BizLeadIcon } from "./BizLeadIcon";

interface BizLeadLogoProps {
  showIcon?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "header";
  variant?: "default" | "badge";
  className?: string;
  style?: React.CSSProperties;
}

export function BizLeadLogo({
  showIcon = true,
  size = "md",
  variant = "default",
  className = "",
  style,
}: BizLeadLogoProps) {
  const iconSize =
    size === "sm" ? 18 : size === "md" ? 24 : size === "lg" ? 30 : 36;

  const fontSizes: Record<string, string> = {
    sm: "16px",
    md: "22px",
    lg: "30px",
    xl: "36px",
    header: "clamp(30px, 2.8vw, 38px)",
  };

  const letterSpacings: Record<string, string> = {
    sm: "-0.6px",
    md: "-1px",
    lg: "-1.5px",
    xl: "-2px",
    header: "-2px",
  };

  const fontSize = fontSizes[size] || fontSizes.md;
  const letterSpacing = letterSpacings[size] || letterSpacings.md;
  const isBadge = variant === "badge";

  return (
    <div
      className={`bl-brand-logo ${isBadge ? "bl-brand-badge" : ""} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size === "sm" ? "6px" : "10px",
        fontFamily: "'Manrope', sans-serif",
        fontWeight: 900,
        lineHeight: 1,
        textDecoration: "none",
        userSelect: "none",
        ...style,
      }}
    >
      {showIcon && (
        <div
          style={{
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <BizLeadIcon
            size={iconSize}
            barColor={isBadge ? "#FFFFFF" : "var(--text)"}
            gapColor={isBadge ? "var(--primary)" : "var(--surface)"}
            accentColor="var(--accent)"
          />
        </div>
      )}

      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          fontSize,
          letterSpacing,
          textTransform: "uppercase",
        }}
      >
        <span
          className="bl-logo-biz"
          style={{
            color: isBadge ? "#FFFFFF" : "var(--text)",
            transition: "color 250ms ease",
          }}
        >
          BIZ
        </span>
        <span
          className="bl-logo-lead"
          style={{
            color: "var(--accent)",
            transition: "color 250ms ease",
          }}
        >
          LEAD
        </span>
      </span>
    </div>
  );
}

export default BizLeadLogo;
