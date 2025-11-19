// components/ui/card.tsx
import * as React from "react";

export function Card({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={
        "rounded-2xl border border-slate-700/70 bg-slate-900/80 shadow-lg backdrop-blur-sm " +
        className
      }
      {...props}
    />
  );
}

export function CardHeader({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={
        "border-b border-slate-700/70 px-5 py-3 flex items-center bg-slate-900/70 rounded-t-2xl " +
        className
      }
      {...props}
    />
  );
}

export function CardTitle({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={
        "text-xs font-semibold uppercase tracking-[0.14em] text-slate-300 " +
        className
      }
      {...props}
    />
  );
}

export function CardContent({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={
        "px-5 py-4 space-y-3 rounded-b-2xl " +
        className
      }
      {...props}
    />
  );
}