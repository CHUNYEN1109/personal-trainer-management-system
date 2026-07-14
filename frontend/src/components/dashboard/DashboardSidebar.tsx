import Link from "next/link";

export type DashboardNavItem = {
  href: string;
  label: string;
};

type DashboardSidebarProps = {
  title: string;
  navItems: DashboardNavItem[];
};

export function DashboardSidebar({ title, navItems }: DashboardSidebarProps) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#071225] px-5 py-6 lg:block">
      <Link href="/" className="mb-8 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/40 bg-cyan-300/10 text-sm font-bold text-cyan-300">
          PT
        </span>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Trainer Hub
          </p>
          <p className="mt-1 text-xs text-[#A8B3C7]">{title}</p>
        </div>
      </Link>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-[#A8B3C7] transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-300"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
