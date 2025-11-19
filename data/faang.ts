// data/faang.ts
export type CompanyId = "AAPL" | "AMZN" | "META" | "NFLX" | "GOOGL";

export interface CompanyFinancials {
  id: CompanyId;
  name: string;
  ticker: string;
  baseYear: number;

  // Base-year financials (millions USD)
  revenue: number;
  ebit: number;
  da: number;
  capex: number;
  changeNwc: number;

  cash: number;
  debt: number;
  sharesOutstanding: number; // millions

  // Default modeling assumptions (percentages as whole numbers)
  defaultGrowth: number;
  defaultEbitMargin: number;
  defaultTaxRate: number;
  defaultDaPct: number;
  defaultCapexPct: number;
  defaultChangeNwcPct: number;
  defaultWacc: number;
  defaultTerminalGrowth: number;
}

// NOTE: Values are in *millions* USD and are approximate, for demo only.
export const COMPANIES: CompanyFinancials[] = [
  {
    id: "AAPL",
    name: "Apple Inc.",
    ticker: "AAPL",
    baseYear: 2024,
    revenue: 383_000,
    ebit: 119_000,
    da: 11_500,
    capex: 10_000,
    changeNwc: 0,

    cash: 60_000,
    debt: 98_000,
    sharesOutstanding: 15_700,

    defaultGrowth: 5,
    defaultEbitMargin: 30,
    defaultTaxRate: 20,
    defaultDaPct: 3,
    defaultCapexPct: 3,
    defaultChangeNwcPct: 1,
    defaultWacc: 8,
    defaultTerminalGrowth: 2,
  },
  {
    id: "AMZN",
    name: "Amazon.com, Inc.",
    ticker: "AMZN",
    baseYear: 2024,
    revenue: 575_000,
    ebit: 46_000,
    da: 30_000,
    capex: 60_000,
    changeNwc: 5_000,

    cash: 80_000,
    debt: 58_000,
    sharesOutstanding: 10_500,

    defaultGrowth: 8,
    defaultEbitMargin: 10,
    defaultTaxRate: 21,
    defaultDaPct: 6,
    defaultCapexPct: 9,
    defaultChangeNwcPct: 2,
    defaultWacc: 9,
    defaultTerminalGrowth: 2.5,
  },
  {
    id: "META",
    name: "Meta Platforms, Inc.",
    ticker: "META",
    baseYear: 2024,
    revenue: 164_000,
    ebit: 70_000,
    da: 15_000,
    capex: 37_000,
    changeNwc: -1_000,

    cash: 45_000,
    debt: 0,
    sharesOutstanding: 2_500,

    defaultGrowth: 7,
    defaultEbitMargin: 40,
    defaultTaxRate: 20,
    defaultDaPct: 6,
    defaultCapexPct: 15,
    defaultChangeNwcPct: 1,
    defaultWacc: 9,
    defaultTerminalGrowth: 2.5,
  },
  {
    id: "NFLX",
    name: "Netflix, Inc.",
    ticker: "NFLX",
    baseYear: 2024,
    revenue: 33_700,
    ebit: 6_000,
    da: 300,
    capex: 400,
    changeNwc: -300,

    cash: 8_000,
    debt: 15_000,
    sharesOutstanding: 430,

    defaultGrowth: 9,
    defaultEbitMargin: 18,
    defaultTaxRate: 20,
    defaultDaPct: 1,
    defaultCapexPct: 2,
    defaultChangeNwcPct: 1,
    defaultWacc: 9.5,
    defaultTerminalGrowth: 2.5,
  },
  {
    id: "GOOGL",
    name: "Alphabet Inc.",
    ticker: "GOOGL",
    baseYear: 2024,
    revenue: 307_000,
    ebit: 95_000,
    da: 15_000,
    capex: 50_000,
    changeNwc: 0,

    cash: 100_000,
    debt: 11_000,
    sharesOutstanding: 12_200,

    defaultGrowth: 6,
    defaultEbitMargin: 30,
    defaultTaxRate: 18,
    defaultDaPct: 5,
    defaultCapexPct: 12,
    defaultChangeNwcPct: 1,
    defaultWacc: 8.5,
    defaultTerminalGrowth: 2,
  },
];

export function getCompanyById(id: CompanyId): CompanyFinancials {
  const c = COMPANIES.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown company id: ${id}`);
  return c;
}