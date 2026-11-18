const assert = require("assert");

// Import metric calculators
const {
  calculateCTR,
  calculateCPC,
  calculateCPM,
  calculateCRMCPL,
  calculateProviderCPL,
  calculateCPQL,
  calculateQualificationRate,
  calculateConversionRate,
  calculateDealWinRate,
  calculateCostPerCustomer,
  calculateValueToSpendRatio,
  calculateROAS,
  formatMetricNumber,
  formatMetricCurrency,
  formatMetricPercent,
} = require("../components/analytics/metricCalculators");

console.log("=== BIZLEAD PHASE 07 — METRIC CALCULATORS UNIT TEST ===");

// 1. Zero Denominators & Safe Handling
assert.strictEqual(calculateCTR(10, 0), null, "CTR with 0 impressions must return null");
assert.strictEqual(calculateCPC(1000, 0), null, "CPC with 0 clicks must return null");
assert.strictEqual(calculateCPM(500, 0), null, "CPM with 0 impressions must return null");
assert.strictEqual(calculateCRMCPL(10000, 0), null, "CPL with 0 leads must return null");
assert.strictEqual(calculateCPQL(10000, 0), null, "CPQL with 0 qualified leads must return null");
assert.strictEqual(calculateQualificationRate(0, 0), null, "Qualification rate with 0 leads must return null");
assert.strictEqual(calculateConversionRate(5, 0), null, "Conversion rate with 0 leads must return null");
assert.strictEqual(calculateCostPerCustomer(10000, 0), null, "Cost per customer with 0 won customers must return null");
assert.strictEqual(calculateValueToSpendRatio(50000, 0), null, "Value to spend with 0 spend must return null");
assert.strictEqual(calculateROAS(50000, 0), null, "ROAS with 0 spend must return null");

// Safe Formatting
assert.strictEqual(formatMetricNumber(null), "N/A", "formatMetricNumber(null) must return 'N/A'");
assert.strictEqual(formatMetricCurrency(null), "N/A", "formatMetricCurrency(null) must return 'N/A'");
assert.strictEqual(formatMetricPercent(null), "N/A", "formatMetricPercent(null) must return 'N/A'");
assert.strictEqual(formatMetricNumber(NaN), "N/A", "formatMetricNumber(NaN) must return 'N/A'");
assert.strictEqual(formatMetricCurrency(Infinity), "N/A", "formatMetricCurrency(Infinity) must return 'N/A'");

console.log("✓ Zero-denominator handling passed (never returns Infinity or NaN)");

// 2. Standard Performance Metrics
// CTR: (500 clicks / 20,000 impressions) * 100 = 2.5%
assert.strictEqual(calculateCTR(500, 20000), 2.5);

// CPC: ₹25,000 spend / 500 clicks = ₹50
assert.strictEqual(calculateCPC(25000, 500), 50);

// CPM: (₹25,000 / 20,000) * 1000 = ₹1,250
assert.strictEqual(calculateCPM(25000, 20000), 1250);

// CRM CPL: ₹25,000 / 50 leads = ₹500
assert.strictEqual(calculateCRMCPL(25000, 50), 500);

// CPQL: ₹25,000 / 20 qualified leads = ₹1,250
assert.strictEqual(calculateCPQL(25000, 20), 1250);

// Qualification Rate: (20 / 50) * 100 = 40%
assert.strictEqual(calculateQualificationRate(20, 50), 40);

// Conversion Rate: (4 won / 50 leads) * 100 = 8%
assert.strictEqual(calculateConversionRate(4, 50), 8);

// Cost Per Customer: ₹25,000 / 4 won = ₹6,250
assert.strictEqual(calculateCostPerCustomer(25000, 4), 6250);

// Value to Spend (ROAS): ₹1,50,000 won value / ₹25,000 spend = 6.0x
assert.strictEqual(calculateValueToSpendRatio(150000, 25000), 6);
assert.strictEqual(calculateROAS(150000, 25000), 6);

console.log("✓ All standard performance formulas match BizLead specifications");

console.log("=== ALL METRIC UNIT TESTS PASSED (14/14) ===");
