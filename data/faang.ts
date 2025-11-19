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

// NOTE: Values are in *millions* USD and sourced from Alpha Vantage.
export const COMPANIES: CompanyFinancials[] = [
  {
    id: "AAPL",
    name: "Apple Inc",
    ticker: "AAPL",
    baseYear: 2025,
    revenue: 416161.0,
    ebit: 133050.0,
    da: 0.0,
    capex: 12715.0,
    changeNwc: 0.0,

    cash: 33539.0,
    debt: 0.0,
    sharesOutstanding: 14776.353,

    defaultGrowth: 5,
    defaultEbitMargin: 32.0,
    defaultTaxRate: 20,
    defaultDaPct: 3,
    defaultCapexPct: 3,
    defaultChangeNwcPct: 1,
    defaultWacc: 8,
    defaultTerminalGrowth: 2,
  },
  {
    id: "AMZN",
    name: "Amazon.com Inc",
    ticker: "AMZN",
    baseYear: 2024,
    revenue: 637959.0,
    ebit: 68593.0,
    da: 0.0,
    capex: 82999.0,
    changeNwc: 0.0,

    cash: 78779.0,
    debt: 0.0,
    sharesOutstanding: 10690.216,

    defaultGrowth: 8,
    defaultEbitMargin: 10.8,
    defaultTaxRate: 21,
    defaultDaPct: 6,
    defaultCapexPct: 9,
    defaultChangeNwcPct: 2,
    defaultWacc: 9,
    defaultTerminalGrowth: 2.5,
  },
  {
    id: "META",
    name: "Meta Platforms Inc.",
    ticker: "META",
    baseYear: 2024,
    revenue: 164501.0,
    ebit: 69380.0,
    da: 0.0,
    capex: 37256.0,
    changeNwc: 0.0,

    cash: 43889.0,
    debt: 0.0,
    sharesOutstanding: 2177.889,

    defaultGrowth: 7,
    defaultEbitMargin: 42.2,
    defaultTaxRate: 20,
    defaultDaPct: 6,
    defaultCapexPct: 15,
    defaultChangeNwcPct: 1,
    defaultWacc: 9,
    defaultTerminalGrowth: 2.5,
  },
  {
    id: "NFLX",
    name: "Netflix Inc",
    ticker: "NFLX",
    baseYear: 2024,
    revenue: 39000.966,
    ebit: 10417.614,
    da: 0.0,
    capex: 439.538,
    changeNwc: 0.0,

    cash: 7804.733,
    debt: 0.0,
    sharesOutstanding: 4237.323,

    defaultGrowth: 9,
    defaultEbitMargin: 26.7,
    defaultTaxRate: 20,
    defaultDaPct: 1,
    defaultCapexPct: 2,
    defaultChangeNwcPct: 1,
    defaultWacc: 9.5,
    defaultTerminalGrowth: 2.5,
  },
  {
    id: "GOOGL",
    name: "Alphabet Inc Class A",
    ticker: "GOOGL",
    baseYear: 2024,
    revenue: 350018.0,
    ebit: 112390.0,
    da: 0.0,
    capex: 52535.0,
    changeNwc: 0.0,

    cash: 23466.0,
    debt: 0.0,
    sharesOutstanding: 5818.0,

    defaultGrowth: 6,
    defaultEbitMargin: 32.1,
    defaultTaxRate: 18,
    defaultDaPct: 5,
    defaultCapexPct: 12,
    defaultChangeNwcPct: 1,
    defaultWacc: 8.5,
    defaultTerminalGrowth: 2,
  }
];

export function getCompanyById(id: CompanyId): CompanyFinancials {
  const c = COMPANIES.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown company id: ${id}`);
  return c;
}
