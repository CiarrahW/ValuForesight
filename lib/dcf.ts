// lib/dcf.ts
import type { CompanyFinancials } from "@/data/faang";

export interface DcfAssumptions {
  revenueGrowthPct: number;      // %
  ebitMarginPct: number;         // %
  taxRatePct: number;            // %
  daPct: number;                 // % of revenue
  capexPct: number;              // % of revenue
  changeNwcPct: number;          // % of revenue
  waccPct: number;               // %
  terminalGrowthPct: number;     // %
  forecastYears: number;         // default 5
}

export interface YearProjection {
  yearIndex: number;        // 1..N
  revenue: number;
  ebit: number;
  ebiat: number;
  da: number;
  capex: number;
  changeNwc: number;
  fcf: number;
  discountFactor: number;
  discountedFcf: number;
}

export interface DcfResult {
  projections: YearProjection[];
  terminalValue: number;
  discountedTerminalValue: number;
  enterpriseValue: number;
  netDebt: number;
  equityValue: number;
  impliedSharePrice: number;
}

/**
 * Core DCF calculation: unlevered FCF, terminal value, EV, equity, per-share.
 * All dollar amounts are in millions.
 */
export function runDcf(
  company: CompanyFinancials,
  assumptions: DcfAssumptions
): DcfResult {
  const years = assumptions.forecastYears;
  const growth = assumptions.revenueGrowthPct / 100;
  const ebitMargin = assumptions.ebitMarginPct / 100;
  const taxRate = assumptions.taxRatePct / 100;
  const daPct = assumptions.daPct / 100;
  const capexPct = assumptions.capexPct / 100;
  const changeNwcPct = assumptions.changeNwcPct / 100;
  const wacc = assumptions.waccPct / 100;
  const g = assumptions.terminalGrowthPct / 100;

  // Safety: prevent invalid TV formula
  const safeWacc = wacc <= g ? g + 0.005 : wacc;

  let revenue = company.revenue;
  const projections: YearProjection[] = [];
  let sumDiscountedFcf = 0;

  for (let t = 1; t <= years; t++) {
    revenue = revenue * (1 + growth);
    const ebit = revenue * ebitMargin;
    const ebiat = ebit * (1 - taxRate);
    const da = revenue * daPct;
    const capex = revenue * capexPct;
    const changeNwc = revenue * changeNwcPct;
    const fcf = ebiat + da - capex - changeNwc;
    const discountFactor = 1 / Math.pow(1 + safeWacc, t);
    const discountedFcf = fcf * discountFactor;
    sumDiscountedFcf += discountedFcf;

    projections.push({
      yearIndex: t,
      revenue,
      ebit,
      ebiat,
      da,
      capex,
      changeNwc,
      fcf,
      discountFactor,
      discountedFcf,
    });
  }

  const lastFcf = projections[projections.length - 1]?.fcf ?? 0;
  const terminalValue = (lastFcf * (1 + g)) / (safeWacc - g);
  const discountedTerminalValue =
    terminalValue / Math.pow(1 + safeWacc, years);

  const enterpriseValue = sumDiscountedFcf + discountedTerminalValue;
  const netDebt = company.debt - company.cash;
  const equityValue = enterpriseValue - netDebt;
  const impliedSharePrice =
    equityValue / company.sharesOutstanding; // all in millions → $/share

  return {
    projections,
    terminalValue,
    discountedTerminalValue,
    enterpriseValue,
    netDebt,
    equityValue,
    impliedSharePrice,
  };
}

/**
 * Helper to build a small sensitivity grid for share price vs. WACC & g.
 * Returns a 3x3 matrix centered on the base (wacc, g).
 */
export interface SensitivityCell {
  waccPct: number;
  terminalGrowthPct: number;
  sharePrice: number;
}

export function buildWaccTerminalSensitivity(
  company: CompanyFinancials,
  baseAssumptions: DcfAssumptions,
  waccStep = 1,
  gStep = 0.5
): SensitivityCell[][] {
  const rows: SensitivityCell[][] = [];
  const baseWacc = baseAssumptions.waccPct;
  const baseG = baseAssumptions.terminalGrowthPct;

  const waccValues = [baseWacc - waccStep, baseWacc, baseWacc + waccStep];
  const gValues = [baseG - gStep, baseG, baseG + gStep];

  for (const w of waccValues) {
    const row: SensitivityCell[] = [];
    for (const gg of gValues) {
      const res = runDcf(company, {
        ...baseAssumptions,
        waccPct: w,
        terminalGrowthPct: gg,
      });
      row.push({
        waccPct: w,
        terminalGrowthPct: gg,
        sharePrice: res.impliedSharePrice,
      });
    }
    rows.push(row);
  }

  return rows;
}