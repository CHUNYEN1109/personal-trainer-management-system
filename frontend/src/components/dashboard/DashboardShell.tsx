import { ReactNode } from "react";

type DashboardShellProps = {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
};

export function DashboardShell({
  sidebar,
  topbar,
  children,
}: DashboardShellProps) {
  return (
    <main className="min-h-screen bg-[#0B192C] text-[#E0E0E0]">
      <div className="flex min-h-screen">
        {sidebar}

        <div className="flex min-h-screen flex-1 flex-col">
          {topbar}

          <section className="flex-1 px-6 py-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
