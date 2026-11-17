"use client";

import React from "react";
import { BizLeadIcon } from "./BizLeadIcon";

interface BizLeadLogoProps {
  showIcon?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "header";
  variant?: "default" | "badge";
  tagline?: string | boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function BizLeadLogo({
  showIcon = true,
  size = "md",
  variant = "default",
  tagline,
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

  const taglineText =
    typeof tagline === "string"
      ? tagline
      : tagline === true || (tagline === undefined && size === "header")
      ? "The Intelligence Behind Growth."
      : undefined;

  const taglineFontSizes: Record<string, string> = {
    sm: "9px",
    md: "10px",
    lg: "11px",
    xl: "12px",
    header: "clamp(11px, 0.9vw, 12px)",
  };

  const taglineFontSize = taglineFontSizes[size] || "11px";

  return (
    <div
      className={`bl-brand-logo ${isBadge ? "bl-brand-badge" : ""} ${className}`}
      style={{
        display: "inline-flex",
        alignItems: showIcon ? "center" : "flex-start",
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

      <div
        className="bl-brand-text-block"
        style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          lineHeight: 1,
        }}
      >
        <span
          className="bl-brand-wordmark"
          style={{
            display: "inline-flex",
            alignItems: "center",
            fontSize,
            letterSpacing,
            textTransform: "uppercase",
            lineHeight: 1,
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

        {taglineText && (
          <span
            className="bl-brand-tagline"
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: taglineFontSize,
              fontWeight: 600,
              color: isBadge ? "#FFFFFF" : "var(--text)",
              transition: "color 250ms ease",
              letterSpacing: "0.2px",
              marginTop: size === "header" ? "-2px" : "0px",
              paddingLeft: size === "header" ? "2.5px" : "1px",
              lineHeight: 1.15,
              whiteSpace: "nowrap",
              textTransform: "none",
            }}
          >
            {taglineText}
          </span>
        )}
      </div>
    </div>
  );
}

export default BizLeadLogo;
