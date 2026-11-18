"use client";

import React from "react";
import { GrowthOverview } from "../../../components/analytics/GrowthOverview";

export default function AnalyticsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <GrowthOverview />
    </div>
  );
}
