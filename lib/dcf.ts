import type { CompanyFinancials } from "@/data/faang";

export type DcfInputs = {
  revenueGrowth: number;      // e.g. 0.08 for 8%
  ebitMargin: number;         // EBIT / Revenue
  taxRate: number;
  daPct: number;              // D&A as % of revenue
  capexPct: number;           // CapEx as % of revenue
  changeNwcPct: number;       // ΔNWC as % of revenue
  wacc: number;               // discount rate
  terminalGrowth: number;     // long-term g
};

export type DcfYearResult = {
  year: number;       // 1..5
  revenue: number;
  ebit: number;
  tax: number;
  nopat: number;
  da: number;
  capex: number;
  changeNwc: number;
  fcf: number;
  discountedFcf: number;
};

export type DcfResult = {
  years: DcfYearResult[];
  presentValueOfForecastFcfs: number;
  presentValueOfTerminalValue: number;
  enterpriseValue: number;
  netDebt: number;
  equityValue: number;
  sharePrice: number;
};

export type WaccTerminalSensitivityResult = {
  waccRates: number[];           // e.g. [7.5, 8.5, 9.5]
  terminalGrowthRates: number[]; // e.g. [1.5, 2.0, 2.5]
  cells: { sharePrice: number }[][]; // [row=wacc][col=g]
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function runDcf(
  company: CompanyFinancials,
  inputs: DcfInputs
): DcfResult {
  const {
    revenueGrowth,
    ebitMargin,
    taxRate,
    daPct,
    capexPct,
    changeNwcPct,
    wacc,
    terminalGrowth,
  } = inputs;

  const years: DcfYearResult[] = [];

  // all monetary values are in millions USD
  let revenue = company.revenue;

  for (let t = 1; t <= 5; t++) {
    revenue = revenue * (1 + revenueGrowth);
    const ebit = revenue * ebitMargin;
    const tax = Math.max(0, ebit * taxRate);
    const nopat = ebit - tax;
    const da = revenue * daPct;
    const capex = revenue * capexPct;
    const changeNwc = revenue * changeNwcPct;
    const fcf = nopat + da - capex - changeNwc;

    const discountFactor = Math.pow(1 + wacc, t);
    const discountedFcf = fcf / discountFactor;

    years.push({
      year: t,
      revenue,
      ebit,
      tax,
      nopat,
      da,
      capex,
      changeNwc,
      fcf,
      discountedFcf,
    });
  }

  const presentValueOfForecastFcfs = years.reduce(
    (sum, y) => sum + y.discountedFcf,
    0
  );

  const lastYear = years[years.length - 1];
  const terminalFcf = lastYear.fcf * (1 + terminalGrowth);
  const terminalValue =
    wacc > terminalGrowth
      ? terminalFcf / (wacc - terminalGrowth)
      : Number.POSITIVE_INFINITY;

  const presentValueOfTerminalValue =
    terminalValue / Math.pow(1 + wacc, 5);

  const enterpriseValue =
    presentValueOfForecastFcfs + presentValueOfTerminalValue;

  const netDebt = company.debt - company.cash; // already in millions
  const equityValue = enterpriseValue - netDebt;

  // equityValue (M) / sharesOutstanding (M) = price in dollars
  const sharePrice =
    company.sharesOutstanding > 0
      ? equityValue / company.sharesOutstanding
      : 0;

  return {
    years,
    presentValueOfForecastFcfs,
    presentValueOfTerminalValue,
    enterpriseValue,
    netDebt,
    equityValue,
    sharePrice,
  };
}

export function buildWaccTerminalSensitivity(
  company: CompanyFinancials,
  baseInputs: DcfInputs
): WaccTerminalSensitivityResult {
  const baseWacc = baseInputs.wacc;
  const baseG = baseInputs.terminalGrowth;

  // 存成百分数（比如 8.5 而不是 0.085），方便在表里展示
  const waccRates = [
    clamp(baseWacc - 0.01, 0.02, 0.25),
    baseWacc,
    clamp(baseWacc + 0.01, 0.02, 0.25),
  ].map((w) => Math.round(w * 1000) / 10);

  const terminalGrowthRates = [
    clamp(baseG - 0.005, 0.0, 0.05),
    baseG,
    clamp(baseG + 0.005, 0.0, 0.05),
  ].map((g) => Math.round(g * 1000) / 10);

  const cells: { sharePrice: number }[][] = [];

  for (const waccPct of waccRates) {
    const row: { sharePrice: number }[] = [];
    for (const gPct of terminalGrowthRates) {
      const wacc = waccPct / 100;
      const g = gPct / 100;
      const result = runDcf(company, { ...baseInputs, wacc, terminalGrowth: g });
      row.push({ sharePrice: result.sharePrice });
    }
    cells.push(row);
  }

  return { waccRates, terminalGrowthRates, cells };
}