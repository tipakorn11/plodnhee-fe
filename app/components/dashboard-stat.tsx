import type { ReactNode } from "react";

type DashboardStatProps = {
  label: string;
  value: ReactNode;
  hint: string;
  color: "red" | "green" | "orange" | "blue";
  icon: ReactNode;
};

export function DashboardStat({ label, value, hint, color, icon }: DashboardStatProps) {
  return <article className={`stat-card stat-${color}`}>
    <div className="stat-heading"><span>{label}</span>{icon}</div>
    <strong className="stat-value">{value}</strong>
    <span className="stat-hint">{hint}</span>
  </article>;
}
