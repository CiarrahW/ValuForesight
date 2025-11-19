// app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  COMPANIES,
  getCompanyById,
  type CompanyFinancials,
  type CompanyId,
} from "@/data/faang";
import {
  runDcf,
  buildWaccTerminalSensitivity,
  type DcfAssumptions,
  type SensitivityCell,
} from "@/lib/dcf";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatMillions(n: number): string {
  if (!isFinite(n)) return "—";
  return n.toLocaleString(undefined, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });
}

function formatPrice(n: number): string {
  if (!isFinite(n)) return "—";
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

function formatPct(n: number): string {
  if (!isFinite(n)) return "—";
  return `${n.toFixed(1)}%`;
}

export default function HomePage() {
  const [selectedId, setSelectedId] = useState<CompanyId>("AAPL");
  const [company, setCompany] = useState<CompanyFinancials>(
    getCompanyById("AAPL")
  );

  const [assumptions, setAssumptions] = useState<DcfAssumptions>({
    revenueGrowthPct: company.defaultGrowth,
    ebitMarginPct: company.defaultEbitMargin,
    taxRatePct: company.defaultTaxRate,
    daPct: company.defaultDaPct,
    capexPct: company.defaultCapexPct,
    changeNwcPct: company.defaultChangeNwcPct,
    waccPct: company.defaultWacc,
    terminalGrowthPct: company.defaultTerminalGrowth,
    forecastYears: 5,
  });

  useEffect(() => {
    const c = getCompanyById(selectedId);
    setCompany(c);
    setAssumptions({
      revenueGrowthPct: c.defaultGrowth,
      ebitMarginPct: c.defaultEbitMargin,
      taxRatePct: c.defaultTaxRate,
      daPct: c.defaultDaPct,
      capexPct: c.defaultCapexPct,
      changeNwcPct: c.defaultChangeNwcPct,
      waccPct: c.defaultWacc,
      terminalGrowthPct: c.defaultTerminalGrowth,
      forecastYears: 5,
    });
  }, [selectedId]);

  const dcfResult = useMemo(
    () => runDcf(company, assumptions),
    [company, assumptions]
  );

  const sensitivity = useMemo(
    () => buildWaccTerminalSensitivity(company, assumptions),
    [company, assumptions]
  );

  const handleNumberChange =
    (field: keyof DcfAssumptions) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const val = parseFloat(raw);
      setAssumptions((prev) => ({
        ...prev,
        [field]: isNaN(val) ? 0 : val,
      }));
    };

  return (
    <main className="space-y-5">
      <header className="flex flex-col gap-2 mb-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          ValuForesight – FAANG DCF
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl">
          Interactive Discounted Cash Flow model for FAANG companies. Adjust
          assumptions and see valuation update in real time.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)]">
        {/* Left: company + assumptions */}
        <div className="space-y-4">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base">Company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="text-sm font-medium text-slate-200">
                Select company
              </label>
              <select
                className="w-full rounded-lg border border-slate-600 bg-slate-900/90 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/70"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value as CompanyId)}
              >
                {COMPANIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.ticker})
                  </option>
                ))}
              </select>
              <div className="mt-2 text-xs text-slate-400 space-y-1">
                <p>Base year: {company.baseYear}</p>
                <p>
                  Revenue: ${formatMillions(company.revenue)}M · EBIT: $
                  {formatMillions(company.ebit)}M
                </p>
                <p>
                  Cash: ${formatMillions(company.cash)}M · Debt: $
                  {formatMillions(company.debt)}M
                </p>
                <p>
                  Shares outstanding:{" "}
                  {company.sharesOutstanding.toLocaleString()}M
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base">Assumptions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1.5">
                <label className="font-medium text-slate-200">
                  Revenue growth (%)
                </label>
                <Input
                  className="bg-slate-950 border-slate-700"
                  type="number"
                  step="0.5"
                  value={assumptions.revenueGrowthPct}
                  onChange={handleNumberChange("revenueGrowthPct")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-200">
                  EBIT margin (%)
                </label>
                <Input
                  className="bg-slate-950 border-slate-700"
                  type="number"
                  step="0.5"
                  value={assumptions.ebitMarginPct}
                  onChange={handleNumberChange("ebitMarginPct")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-200">
                  Tax rate (%)
                </label>
                <Input
                  className="bg-slate-950 border-slate-700"
                  type="number"
                  step="0.5"
                  value={assumptions.taxRatePct}
                  onChange={handleNumberChange("taxRatePct")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-200">
                  D&amp;A (% of revenue)
                </label>
                <Input
                  className="bg-slate-950 border-slate-700"
                  type="number"
                  step="0.5"
                  value={assumptions.daPct}
                  onChange={handleNumberChange("daPct")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-200">
                  CapEx (% of revenue)
                </label>
                <Input
                  className="bg-slate-950 border-slate-700"
                  type="number"
                  step="0.5"
                  value={assumptions.capexPct}
                  onChange={handleNumberChange("capexPct")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-200">
                  Δ NWC (% of revenue)
                </label>
                <Input
                  className="bg-slate-950 border-slate-700"
                  type="number"
                  step="0.5"
                  value={assumptions.changeNwcPct}
                  onChange={handleNumberChange("changeNwcPct")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-200">
                  WACC (%)
                </label>
                <Input
                  className="bg-slate-950 border-slate-700"
                  type="number"
                  step="0.25"
                  value={assumptions.waccPct}
                  onChange={handleNumberChange("waccPct")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-slate-200">
                  Terminal growth (%)
                </label>
                <Input
                  className="bg-slate-950 border-slate-700"
                  type="number"
                  step="0.25"
                  value={assumptions.terminalGrowthPct}
                  onChange={handleNumberChange("terminalGrowthPct")}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: forecasts + valuation */}
        <div className="space-y-4">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base">
                5-Year Forecast &amp; FCF (millions USD)
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-slate-900/90">
                      Item
                    </TableHead>
                    {dcfResult.projections.map((p) => (
                      <TableHead key={p.yearIndex}>
                        Year {p.yearIndex}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="sticky left-0 bg-slate-900/90">
                      Revenue
                    </TableCell>
                    {dcfResult.projections.map((p) => (
                      <TableCell key={p.yearIndex}>
                        ${formatMillions(p.revenue)}M
                      </TableCell>
                    ))}
                  </TableRow>

                  <TableRow>
                    <TableCell className="sticky left-0 bg-slate-900/90">
                      EBIT
                    </TableCell>
                    {dcfResult.projections.map((p) => (
                      <TableCell key={p.yearIndex}>
                        ${formatMillions(p.ebit)}M
                      </TableCell>
                    ))}
                  </TableRow>

                  <TableRow>
                    <TableCell className="sticky left-0 bg-slate-900/90">
                      FCF
                    </TableCell>
                    {dcfResult.projections.map((p) => (
                      <TableCell key={p.yearIndex}>
                        ${formatMillions(p.fcf)}M
                      </TableCell>
                    ))}
                  </TableRow>

                  <TableRow>
                    <TableCell className="sticky left-0 bg-slate-900/90">
                      Discounted FCF
                    </TableCell>
                    {dcfResult.projections.map((p) => (
                      <TableCell key={p.yearIndex}>
                        ${formatMillions(p.discountedFcf)}M
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base">Valuation Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  PV of forecast FCFs
                </div>
                <div className="text-base">
                  $
                  {formatMillions(
                    dcfResult.projections.reduce(
                      (acc, p) => acc + p.discountedFcf,
                      0
                    )
                  )}
                  M
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Terminal value (PV)
                </div>
                <div className="text-base">
                  ${formatMillions(dcfResult.discountedTerminalValue)}M
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Enterprise value (EV)
                </div>
                <div className="text-base">
                  ${formatMillions(dcfResult.enterpriseValue)}M
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Net debt (Debt − Cash)
                </div>
                <div className="text-base">
                  ${formatMillions(dcfResult.netDebt)}M
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Equity value
                </div>
                <div className="text-base">
                  ${formatMillions(dcfResult.equityValue)}M
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-slate-400">
                  Implied price / share
                </div>
                <div className="text-xl font-semibold text-emerald-300">
                  {formatPrice(dcfResult.impliedSharePrice)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sensitivity */}
      <Card className="bg-slate-900/70 border-slate-800">
        <CardHeader>
          <CardTitle className="text-base">
            Sensitivity: WACC vs Terminal Growth (Implied Price)
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto text-sm">
          <div className="mb-2 text-xs text-slate-400">
            Center cell = base case (current WACC and terminal growth
            assumptions).
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-slate-900">
                  WACC ↓ / g →
                </TableHead>
                {sensitivity[0].map((cell: SensitivityCell, idx) => (
                  <TableHead key={idx}>
                    {formatPct(cell.terminalGrowthPct)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sensitivity.map((row, rowIdx) => (
                <TableRow key={rowIdx}>
                  <TableCell className="sticky left-0 bg-slate-900">
                    {formatPct(row[0].waccPct)}
                  </TableCell>
                  {row.map((cell, colIdx) => {
                    const isBase =
                      Math.abs(cell.waccPct - assumptions.waccPct) < 1e-6 &&
                      Math.abs(
                        cell.terminalGrowthPct - assumptions.terminalGrowthPct
                      ) < 1e-6;
                    return (
                      <TableCell
                        key={colIdx}
                        className={
                          isBase
                            ? "font-semibold text-emerald-300"
                            : "text-slate-100"
                        }
                      >
                        {formatPrice(cell.sharePrice)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}