type DashboardTopbarProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function DashboardTopbar({
  title,
  subtitle,
  action,
}: DashboardTopbarProps) {
  return (
    <header className="border-b border-white/10 bg-[#0B192C]/90 px-6 py-5 backdrop-blur lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Dashboard
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm leading-6 text-[#A8B3C7]">
              {subtitle}
            </p>
          )}
        </div>

        {action && <div>{action}</div>}
      </div>
    </header>
  );
}
