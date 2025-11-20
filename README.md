# ValuForesight — Interactive FAANG DCF Model

**Live Demo:**
👉 https://valu-foresight.vercel.app/

ValuForesight is an interactive **Discounted Cash Flow (DCF) valuation tool** for FAANG companies (AAPL, AMZN, META, NFLX, GOOGL).
Users can modify key financial assumptions and instantly see the impact on free cash flows, enterprise value, equity value, and implied share price — all within a clean, modern FinTech-style dashboard.

---

## Online Demo vs  Local Version

### Online Version (Vercel Demo)

- Automatically built and deployed from the GitHub `main` branch
- Uses the pre-generated local dataset `data/faang.ts`
- **Does not** require any API keys
- **Does not** make live financial API calls (fast & secure)
- Ideal for recruiters, interviewers, and portfolio links
- The link always reflects the latest version of the project

### Local Development Version

- Full editable source code
- Supports running the **ETL pipeline** to fetch fresh FAANG financial statements via Alpha Vantage
- Regenerates `data/faang.ts` with updated revenue, EBIT, cash, debt, and shares
- After committing and pushing, Vercel auto-deploys the updated version
- Requires an Alpha Vantage API key locally (never exposed in production)

---

## Features

### Real-Time Valuation Controls

Users can adjust:

- Revenue growth (%)
- EBIT margin (% of revenue)
- Tax rate (%)
- Depreciation & Amortization (% of revenue)
- Capital Expenditures (% of revenue)
- Change in Net Working Capital (% of revenue)
- WACC (%)
- Terminal growth (%)

Every valuation output updates instantly.

### 5-Year Forecast & DCF Outputs

Includes:

- Revenue forecast
- EBIT & NOPAT
- D&A, CapEx, ΔNWC
- Free Cash Flow (FCF)
- Discounted FCFs
- Terminal value
- Enterprise value (EV)
- Net debt
- Equity value
- Implied price per share

### WACC × Terminal Growth Sensitivity Matrix

A 3×3 matrix showing how implied share price responds to:

- WACC (base ± 1%)
- Terminal growth (base ± 0.5%)

### Professional FinTech UI

- Dark institutional color palette
- shadcn/ui components: `Card`, `Table`, `Select`, `Input`
- Tailwind CSS with custom theme tokens

---

## Data Source & ETL Pipeline

FAANG financial data is **not manually hard-coded**.It is extracted using a dedicated ETL script:

- **Source:** Alpha Vantage
- **Script:** `scripts/update_faang_from_alpha.py`
- **Output:** `data/faang.ts` (typed dataset used by the frontend)

The ETL fetches:

- Income Statement
- Balance Sheet
- Cash Flow Statement
- Company Overview

All values are converted, cleaned, standardized, and stored locally in TypeScript for fast, static client-side loading.

---

## DCF Methodology

### Free Cash Flow

FCF = NOPAT + D&A – CapEx – ΔNWC

### Terminal Value (Gordon Growth)

TV = (FCF_5 × (1 + g)) / (WACC – g)

### Enterprise Value

EV = Σ(PV of FCF_1..5) + PV(TV)

### Equity Value

Equity = EV – Net Debt

### Implied Share Price

Price = Equity / Shares Outstanding

All logic implemented in `lib/dcf.ts`.

---

## Tech Stack

**Frontend**

- Next.js (App Router, TypeScript)
- React
- Tailwind CSS
- shadcn/ui components

**Data Pipeline**

- Python (requests, polars)
- Alpha Vantage API
- Local TypeScript dataset generation

**Deployment**

- Vercel (automatic builds & hosting)

---

## Local Setup

### 1. Clone the repository

```
git clone https://github.com/CiarrahW/ValuForesight.git
cd ValuForesight
```

### 2. Install dependencies

```
npm install
```

### 3. Refresh FAANG data (optional)

```
export Faang="YOUR_ALPHA_VANTAGE_API_KEY"
python scripts/update_faang_from_alpha.py
```

### 4. Run the server

```
npm run dev
```
