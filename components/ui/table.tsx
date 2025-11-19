// components/ui/table.tsx
import * as React from "react";

export function Table(
  props: React.TableHTMLAttributes<HTMLTableElement>
) {
  return (
    <table
      className={
        "w-full border-collapse text-sm text-slate-100 " +
        (props.className ?? "")
      }
      {...props}
    />
  );
}

export function TableHeader(
  props: React.HTMLAttributes<HTMLTableSectionElement>
) {
  return (
    <thead
      className={
        "bg-slate-900/90 border-b border-slate-700/80 " +
        (props.className ?? "")
      }
      {...props}
    />
  );
}

export function TableBody(
  props: React.HTMLAttributes<HTMLTableSectionElement>
) {
  return <tbody className={props.className} {...props} />;
}

export function TableRow(
  props: React.HTMLAttributes<HTMLTableRowElement>
) {
  return (
    <tr
      className={
        "border-b border-slate-800/80 last:border-0 hover:bg-slate-900/60 transition " +
        (props.className ?? "")
      }
      {...props}
    />
  );
}

export function TableHead(
  props: React.ThHTMLAttributes<HTMLTableCellElement>
) {
  return (
    <th
      className={
        "px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 text-left " +
        (props.className ?? "")
      }
      {...props}
    />
  );
}

export function TableCell(
  props: React.TdHTMLAttributes<HTMLTableCellElement>
) {
  return (
      <td
        className={
          "px-3 py-2 align-top text-slate-100 " +
          (props.className ?? "")
        }
        {...props}
      />
  );
}