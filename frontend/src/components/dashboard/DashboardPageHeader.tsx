import { ReactNode } from "react";

type DashboardPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function DashboardPageHeader({
  eyebrow = "Overview",
  title,
  description,
  action,
}: DashboardPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-white">{title}</h2>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#A8B3C7]">
            {description}
          </p>
        )}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}
