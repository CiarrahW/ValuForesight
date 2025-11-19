"use client";

import { useMemo, useState } from "react";
import { COMPANIES, CompanyFinancials, getCompanyById } from "@/data/faang";
import { runDcf, buildWaccTerminalSensitivity } from "@/lib/dcf";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Assumptions = {
  growth: number;
  ebitMargin: number;
  taxRate: number;
  daPct: number;
  capexPct: number;
  changeNwcPct: number;
  wacc: number;
  terminalGrowth: number;
};

function formatMillions(n: number): string {
  if (!isFinite(n)) return "—";
  return `${n.toLocaleString("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })}M`;
}

function formatDollars(n: number): string {
  if (!isFinite(n)) return "—";
  return `$${n.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

export default function Page() {
  const [selectedId, setSelectedId] = useState<CompanyFinancials["id"]>(
    COMPANIES[0].id
  );

  const company = useMemo(() => getCompanyById(selectedId), [selectedId]);

  const [assumptions, setAssumptions] = useState<Assumptions>({
    growth: company.defaultGrowth,
    ebitMargin: company.defaultEbitMargin,
    taxRate: company.defaultTaxRate,
    daPct: company.defaultDaPct,
    capexPct: company.defaultCapexPct,
    changeNwcPct: company.defaultChangeNwcPct,
    wacc: company.defaultWacc,
    terminalGrowth: company.defaultTerminalGrowth,
  });

  function handleCompanyChange(id: CompanyFinancials["id"]) {
    const next = getCompanyById(id);
    setSelectedId(id);
    setAssumptions({
      growth: next.defaultGrowth,
      ebitMargin: next.defaultEbitMargin,
      taxRate: next.defaultTaxRate,
      daPct: next.defaultDaPct,
      capexPct: next.defaultCapexPct,
      changeNwcPct: next.defaultChangeNwcPct,
      wacc: next.defaultWacc,
      terminalGrowth: next.defaultTerminalGrowth,
    });
  }

  function updateAssumption<K extends keyof Assumptions>(
    key: K,
    value: string
  ) {
    const num = Number(value.replace(/,/g, ""));
    if (Number.isNaN(num)) return;
    setAssumptions((prev) => ({ ...prev, [key]: num }));
  }

  const dcfResult = useMemo(
    () =>
      runDcf(company, {
        revenueGrowth: assumptions.growth / 100,
        ebitMargin: assumptions.ebitMargin / 100,
        taxRate: assumptions.taxRate / 100,
        daPct: assumptions.daPct / 100,
        capexPct: assumptions.capexPct / 100,
        changeNwcPct: assumptions.changeNwcPct / 100,
        wacc: assumptions.wacc / 100,
        terminalGrowth: assumptions.terminalGrowth / 100,
      }),
    [company, assumptions]
  );

  const sensitivity = useMemo(
    () =>
      buildWaccTerminalSensitivity(company, {
        revenueGrowth: assumptions.growth / 100,
        ebitMargin: assumptions.ebitMargin / 100,
        taxRate: assumptions.taxRate / 100,
        daPct: assumptions.daPct / 100,
        capexPct: assumptions.capexPct / 100,
        changeNwcPct: assumptions.changeNwcPct / 100,
        wacc: assumptions.wacc / 100,
        terminalGrowth: assumptions.terminalGrowth / 100,
      }),
    [company, assumptions]
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10 pt-8">
        {/* Top header */}
        <header className="flex flex-col gap-3 mb-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              ValuForesight
            </h1>
            <span className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              FAANG DCF Engine
            </span>
          </div>
          <p className="text-sm text-slate-300 max-w-3xl">
            Interactive discounted cash flow model for FAANG companies. Adjust
            core assumptions (growth, margins, tax rate, WACC, terminal growth)
            and see the valuation update in real time.
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
            <span className="rounded-full bg-slate-900/80 px-2 py-1 border border-slate-700/70">
              Next.js · TypeScript · Tailwind
            </span>
            <span className="rounded-full bg-slate-900/80 px-2 py-1 border border-slate-700/70">
              DCF · EV / Equity value · Sensitivity
            </span>
          </div>
        </header>

        {/* Company + 5-year  */}
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
          <Card className="border-slate-800 bg-slate-900/70 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-[0.12em] text-slate-400">
                COMPANY
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-slate-300">
                  Select company
                </label>
                <Select
                  value={selectedId}
                  onValueChange={(v) => handleCompanyChange(v as any)}
                >
                  <SelectTrigger className="h-9 border-slate-700 bg-slate-950/70 text-sm">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border border-slate-700 text-slate-50 shadow-lg">
                    {COMPANIES.map((c) => (
                      <SelectItem
                        key={c.ticker}
                        value={c.ticker}
                        className="text-slate-50 data-[highlighted]:bg-slate-800 data-[highlighted]:text-slate-50 focus:bg-slate-800 focus:text-slate-50"
                      >
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-3 text-xs text-slate-300 space-y-1.5">
                <div>Base year: {company.baseYear}</div>
                <div>
                  Revenue:{" "}
                  <span className="font-medium">
                    {formatMillions(company.revenue)}
                  </span>{" "}
                  · EBIT:{" "}
                  <span className="font-medium">
                    {formatMillions(company.ebit)}
                  </span>
                </div>
                <div>
                  Cash:{" "}
                  <span className="font-medium">
                    {formatMillions(company.cash)}
                  </span>{" "}
                  · Debt:{" "}
                  <span className="font-medium">
                    {formatMillions(company.debt)}
                  </span>
                </div>
                <div>
                  Shares outstanding:{" "}
                  <span className="font-medium">
                    {company.sharesOutstanding.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                    M
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold tracking-[0.12em] text-slate-400">
                5-YEAR FORECAST &amp; FCF (MILLIONS USD)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead className="w-28 text-xs text-slate-400">
                      Item
                    </TableHead>
                    {dcfResult.years.map((y) => (
                      <TableHead
                        key={y.year}
                        className="text-right text-xs text-slate-400"
                      >
                        YEAR {y.year}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-slate-900/60">
                    <TableCell className="text-xs text-slate-300">
                      Revenue
                    </TableCell>
                    {dcfResult.years.map((y) => (
                      <TableCell
                        key={y.year}
                        className="text-right text-xs font-medium text-slate-100"
                      >
                        {formatMillions(y.revenue)}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="border-slate-900/60">
                    <TableCell className="text-xs text-slate-300">
                      EBIT
                    </TableCell>
                    {dcfResult.years.map((y) => (
                      <TableCell
                        key={y.year}
                        className="text-right text-xs text-slate-200"
                      >
                        {formatMillions(y.ebit)}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="border-slate-900/60">
                    <TableCell className="text-xs text-slate-300">
                      FCF
                    </TableCell>
                    {dcfResult.years.map((y) => (
                      <TableCell
                        key={y.year}
                        className="text-right text-xs text-slate-200"
                      >
                        {formatMillions(y.fcf)}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs text-slate-300">
                      Discounted FCF
                    </TableCell>
                    {dcfResult.years.map((y) => (
                      <TableCell
                        key={y.year}
                        className="text-right text-xs text-slate-200"
                      >
                        {formatMillions(y.discountedFcf)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Assumptions + Valuation Summary */}
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1.4fr)]">
          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold tracking-[0.12em] text-slate-400">
                ASSUMPTIONS
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">
                  Revenue growth (%)
                </label>
                <Input
                  className="h-8 border-slate-700 bg-slate-950/70 text-xs"
                  value={assumptions.growth}
                  onChange={(e) =>
                    updateAssumption("growth", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">
                  EBIT margin (%)
                </label>
                <Input
                  className="h-8 border-slate-700 bg-slate-950/70 text-xs"
                  value={assumptions.ebitMargin}
                  onChange={(e) =>
                    updateAssumption("ebitMargin", e.target.value)
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">
                  Tax rate (%)
                </label>
                <Input
                  className="h-8 border-slate-700 bg-slate-950/70 text-xs"
                  value={assumptions.taxRate}
                  onChange={(e) =>
                    updateAssumption("taxRate", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">
                  D&amp;A (% of revenue)
                </label>
                <Input
                  className="h-8 border-slate-700 bg-slate-950/70 text-xs"
                  value={assumptions.daPct}
                  onChange={(e) =>
                    updateAssumption("daPct", e.target.value)
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">
                  CapEx (% of revenue)
                </label>
                <Input
                  className="h-8 border-slate-700 bg-slate-950/70 text-xs"
                  value={assumptions.capexPct}
                  onChange={(e) =>
                    updateAssumption("capexPct", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">
                  Δ NWC (% of revenue)
                </label>
                <Input
                  className="h-8 border-slate-700 bg-slate-950/70 text-xs"
                  value={assumptions.changeNwcPct}
                  onChange={(e) =>
                    updateAssumption("changeNwcPct", e.target.value)
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">
                  WACC (%)
                </label>
                <Input
                  className="h-8 border-slate-700 bg-slate-950/70 text-xs"
                  value={assumptions.wacc}
                  onChange={(e) =>
                    updateAssumption("wacc", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300">
                  Terminal growth (%)
                </label>
                <Input
                  className="h-8 border-slate-700 bg-slate-950/70 text-xs"
                  value={assumptions.terminalGrowth}
                  onChange={(e) =>
                    updateAssumption("terminalGrowth", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold tracking-[0.12em] text-slate-400">
                VALUATION SUMMARY
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-y-2 text-xs text-slate-200">
              <div>
                <div className="text-[11px] text-slate-400 mb-0.5">
                  PV of forecast FCFs
                </div>
                <div className="font-medium">
                  {formatMillions(dcfResult.presentValueOfForecastFcfs)}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 mb-0.5">
                  Terminal value (PV)
                </div>
                <div className="font-medium">
                  {formatMillions(dcfResult.presentValueOfTerminalValue)}
                </div>
              </div>

              <div className="pt-1">
                <div className="text-[11px] text-slate-400 mb-0.5">
                  Enterprise value (EV)
                </div>
                <div className="font-medium">
                  {formatMillions(dcfResult.enterpriseValue)}
                </div>
              </div>
              <div className="pt-1">
                <div className="text-[11px] text-slate-400 mb-0.5">
                  Net debt (debt – cash)
                </div>
                <div className="font-medium">
                  {formatMillions(dcfResult.netDebt)}
                </div>
              </div>

              <div className="pt-1">
                <div className="text-[11px] text-slate-400 mb-0.5">
                  Equity value
                </div>
                <div className="font-medium">
                  {formatMillions(dcfResult.equityValue)}
                </div>
              </div>
              <div className="pt-1">
                <div className="text-[11px] text-slate-400 mb-0.5">
                  Implied price / share
                </div>
                <div className="text-lg font-semibold text-emerald-400">
                  {formatDollars(dcfResult.sharePrice)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 第三排：敏感性分析 */}
        <Card className="border-slate-800 bg-slate-900/70">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold tracking-[0.12em] text-slate-400">
              SENSITIVITY: WACC VS TERMINAL GROWTH (IMPLIED PRICE)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-[11px] text-slate-400">
              Center cell = base case (current WACC and terminal growth
              assumptions).
            </p>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="w-32 text-[11px] text-slate-400">
                    WACC ↓ / g →
                  </TableHead>
                  {sensitivity.terminalGrowthRates.map((g) => (
                    <TableHead
                      key={g}
                      className="text-right text-[11px] text-slate-400"
                    >
                      {g.toFixed(1)}%
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sensitivity.waccRates.map((wacc, rowIdx) => (
                  <TableRow key={wacc} className="border-slate-900/60">
                    <TableCell className="text-[11px] text-slate-400">
                      {wacc.toFixed(1)}%
                    </TableCell>
                    {sensitivity.cells[rowIdx].map((cell, colIdx) => {
                      const isBase =
                        Math.abs(wacc - assumptions.wacc) < 1e-6 &&
                        Math.abs(
                          sensitivity.terminalGrowthRates[colIdx] -
                            assumptions.terminalGrowth
                        ) < 1e-6;
                      return (
                        <TableCell
                          key={colIdx}
                          className={`text-right text-xs ${
                            isBase
                              ? "font-semibold text-emerald-400"
                              : "text-slate-200"
                          }`}
                        >
                          {formatDollars(cell.sharePrice)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <p className="mt-4 text-[11px] text-slate-500 text-right">
          Financial data sourced from Alpha Vantage & Structify-style analytics pipeline via a custom ETL script;
          values represent the latest available annual reports and are expressed
          in millions of USD.
        </p>
      </div>
    </main>
  );
}