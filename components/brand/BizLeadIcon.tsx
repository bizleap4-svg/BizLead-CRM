"use client";

import React from "react";

interface BizLeadIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  accentColor?: string;
  barColor?: string;
  gapColor?: string;
}

export function BizLeadIcon({
  size = 32,
  accentColor = "var(--accent)",
  barColor = "#FFFFFF",
  gapColor = "var(--primary)",
  className,
  style,
  ...props
}: BizLeadIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
      aria-label="BizLead Logo Icon"
      {...props}
    >
      {/* 3 Rising Vertical Bars */}
      <rect x="13" y="53" width="20" height="41" rx="4" fill={barColor} />
      <rect x="38" y="45" width="20" height="49" rx="4" fill={barColor} />
      <rect x="63" y="33" width="20" height="61" rx="4" fill={barColor} />

      {/* Dynamic Gap/Cutout around Arrow separating from bars */}
      <path
        d="M 8 56 L 39 34 L 56 46 L 82 20"
        fill="none"
        stroke={gapColor}
        strokeWidth="13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points="97,7 74,13 82,21 91,29"
        fill={gapColor}
        stroke={gapColor}
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* Upward Growth Arrow Shaft */}
      <path
        d="M 8 56 L 39 34 L 56 46 L 82 20"
        fill="none"
        stroke={accentColor}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Arrow Head with Notched Base */}
      <polygon
        points="97,7 76,14 82,20 90,26"
        fill={accentColor}
        stroke={accentColor}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default BizLeadIcon;
