import os
import time
import json
from typing import Dict, Any, List

import requests


SYMBOLS = ["AAPL", "AMZN", "META", "NFLX", "GOOGL"]

# These match your current defaults in data/faang.ts
DEFAULT_ASSUMPTIONS = {
    "AAPL": {
        "defaultGrowth": 5,
        "defaultEbitMargin": 30,
        "defaultTaxRate": 20,
        "defaultDaPct": 3,
        "defaultCapexPct": 3,
        "defaultChangeNwcPct": 1,
        "defaultWacc": 8,
        "defaultTerminalGrowth": 2,
    },
    "AMZN": {
        "defaultGrowth": 8,
        "defaultEbitMargin": 10,
        "defaultTaxRate": 21,
        "defaultDaPct": 6,
        "defaultCapexPct": 9,
        "defaultChangeNwcPct": 2,
        "defaultWacc": 9,
        "defaultTerminalGrowth": 2.5,
    },
    "META": {
        "defaultGrowth": 7,
        "defaultEbitMargin": 40,
        "defaultTaxRate": 20,
        "defaultDaPct": 6,
        "defaultCapexPct": 15,
        "defaultChangeNwcPct": 1,
        "defaultWacc": 9,
        "defaultTerminalGrowth": 2.5,
    },
    "NFLX": {
        "defaultGrowth": 9,
        "defaultEbitMargin": 18,
        "defaultTaxRate": 20,
        "defaultDaPct": 1,
        "defaultCapexPct": 2,
        "defaultChangeNwcPct": 1,
        "defaultWacc": 9.5,
        "defaultTerminalGrowth": 2.5,
    },
    "GOOGL": {
        "defaultGrowth": 6,
        "defaultEbitMargin": 30,
        "defaultTaxRate": 18,
        "defaultDaPct": 5,
        "defaultCapexPct": 12,
        "defaultChangeNwcPct": 1,
        "defaultWacc": 8.5,
        "defaultTerminalGrowth": 2,
    },
}


def safe_float(value):
    if value is None or value in ("None", "", "null"):
        return 0.0
    try:
        return float(value)
    except (ValueError, TypeError):
        return 0.0


def fetch_alpha_json(url: str) -> Dict[str, Any]:
    resp = requests.get(url)
    resp.raise_for_status()
    return resp.json()


def fetch_company_financials(symbol: str, api_key: str) -> Dict[str, Any]:
    print(f"\n=== Fetching {symbol} ===")

    # INCOME STATEMENT
    income_url = (
        f"https://www.alphavantage.co/query?"
        f"function=INCOME_STATEMENT&symbol={symbol}&apikey={api_key}"
    )
    income_data = fetch_alpha_json(income_url)
    time.sleep(12)

    # BALANCE SHEET
    balance_url = (
        f"https://www.alphavantage.co/query?"
        f"function=BALANCE_SHEET&symbol={symbol}&apikey={api_key}"
    )
    balance_data = fetch_alpha_json(balance_url)
    time.sleep(12)

    # CASH FLOW
    cashflow_url = (
        f"https://www.alphavantage.co/query?"
        f"function=CASH_FLOW&symbol={symbol}&apikey={api_key}"
    )
    cashflow_data = fetch_alpha_json(cashflow_url)
    time.sleep(12)

    # OVERVIEW (for name + shares)
    overview_url = (
        f"https://www.alphavantage.co/query?"
        f"function=OVERVIEW&symbol={symbol}&apikey={api_key}"
    )
    overview_data = fetch_alpha_json(overview_url)

    annual_income = income_data.get("annualReports", [])
    annual_balance = balance_data.get("annualReports", [])
    annual_cash = cashflow_data.get("annualReports", [])

    if not annual_income or not annual_balance or not annual_cash:
        raise RuntimeError(f"Missing annual reports for {symbol}")

    # take the most recent year (index 0)
    inc = annual_income[0]
    bal = annual_balance[0]
    cfs = annual_cash[0]

    fiscal_date = inc.get("fiscalDateEnding", "")
    base_year = int(fiscal_date[:4]) if fiscal_date else 0

    # Extract core fields (absolute USD, convert to millions later)
    total_revenue = safe_float(inc.get("totalRevenue"))
    operating_income = safe_float(inc.get("operatingIncome"))

    # depreciation & amortization (cash flow statement)
    da = safe_float(cfs.get("depreciationAndAmortization"))

    capex = safe_float(cfs.get("capitalExpenditures"))
    change_wc = safe_float(cfs.get("changeInWorkingCapital"))

    cash = safe_float(bal.get("cashAndCashEquivalentsAtCarryingValue"))
    total_debt = safe_float(bal.get("totalDebt"))

    shares_out = safe_float(overview_data.get("SharesOutstanding"))
    company_name = overview_data.get("Name", symbol)

    if total_revenue == 0 or operating_income == 0:
        print(f"⚠️ Warning: revenue or operating income is zero for {symbol}")

    # Convert to millions
    def to_millions(x: float) -> float:
        return round(x / 1_000_000, 3)

    revenue_m = to_millions(total_revenue)
    ebit_m = to_millions(operating_income)
    da_m = to_millions(da)
    capex_m = to_millions(capex)
    change_wc_m = to_millions(change_wc)
    cash_m = to_millions(cash)
    debt_m = to_millions(total_debt)
    shares_m = round(shares_out / 1_000_000, 3) if shares_out else 0.0

    return {
        "id": symbol,
        "name": company_name,
        "ticker": symbol,
        "baseYear": base_year,
        "revenue": revenue_m,
        "ebit": ebit_m,
        "da": da_m,
        "capex": capex_m,
        "changeNwc": change_wc_m,
        "cash": cash_m,
        "debt": debt_m,
        "sharesOutstanding": shares_m,
    }


def build_ts_file(companies: List[Dict[str, Any]]) -> str:
    # header: type + interface
    header = """// data/faang.ts
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
"""

    body_parts: List[str] = []

    for c in companies:
        sym = c["ticker"]
        defaults = DEFAULT_ASSUMPTIONS.get(sym, {
            "defaultGrowth": 5,
            "defaultEbitMargin": round((c["ebit"] / c["revenue"]) * 100, 1) if c["revenue"] else 20,
            "defaultTaxRate": 20,
            "defaultDaPct": 5,
            "defaultCapexPct": 5,
            "defaultChangeNwcPct": 1,
            "defaultWacc": 9,
            "defaultTerminalGrowth": 2,
        })

        # if we have ebit/revenue, recompute margin to keep more realistic
        default_ebit_margin = defaults.get("defaultEbitMargin")
        if c["revenue"]:
            default_ebit_margin = round((c["ebit"] / c["revenue"]) * 100, 1)

        safe_name = c['name'].replace('"', '\\"')
        entry = f"""  {{
    id: "{c['id']}",
    name: "{safe_name}",
    ticker: "{c['ticker']}",
    baseYear: {c['baseYear']},
    revenue: {c['revenue']},
    ebit: {c['ebit']},
    da: {c['da']},
    capex: {c['capex']},
    changeNwc: {c['changeNwc']},

    cash: {c['cash']},
    debt: {c['debt']},
    sharesOutstanding: {c['sharesOutstanding']},

    defaultGrowth: {defaults['defaultGrowth']},
    defaultEbitMargin: {default_ebit_margin},
    defaultTaxRate: {defaults['defaultTaxRate']},
    defaultDaPct: {defaults['defaultDaPct']},
    defaultCapexPct: {defaults['defaultCapexPct']},
    defaultChangeNwcPct: {defaults['defaultChangeNwcPct']},
    defaultWacc: {defaults['defaultWacc']},
    defaultTerminalGrowth: {defaults['defaultTerminalGrowth']},
  }}"""
        body_parts.append(entry)

    body = ",\n".join(body_parts)

    footer = """
];

export function getCompanyById(id: CompanyId): CompanyFinancials {
  const c = COMPANIES.find((c) => c.id === id);
  if (!c) throw new Error(`Unknown company id: ${id}`);
  return c;
}
"""

    return header + body + footer


def main():
    api_key = os.environ.get("Faang")
    if not api_key:
        raise RuntimeError("Please set environment variable Faang to your Alpha Vantage API key.")

    all_companies: List[Dict[str, Any]] = []
    for symbol in SYMBOLS:
        data = fetch_company_financials(symbol, api_key)
        all_companies.append(data)

        # extra sleep between symbols to respect free-tier limits
        if symbol != SYMBOLS[-1]:
            time.sleep(15)

    ts_content = build_ts_file(all_companies)

    # write to data/faang.ts (relative to project root)
    out_path = os.path.join(os.path.dirname(__file__), "..", "data", "faang.ts")
    out_path = os.path.abspath(out_path)

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(ts_content)

    print(f"\n Updated {out_path} with fresh FAANG financials from Alpha Vantage.")


if __name__ == "__main__":
    main()