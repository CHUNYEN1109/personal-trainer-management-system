import { HTMLAttributes } from "react";

type BadgeVariant =
  | "default"
  | "active"
  | "inactive"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "client"
  | "trainer";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-white/20 bg-white/10 text-white",
  active: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  inactive: "border-gray-400/30 bg-gray-400/10 text-gray-300",
  pending: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
  confirmed: "border-cyan-300/30 bg-cyan-300/10 text-cyan-300",
  completed: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  cancelled: "border-red-400/30 bg-red-400/10 text-red-300",
  client: "border-purple-400/30 bg-purple-400/10 text-purple-300",
  trainer: "border-cyan-300/30 bg-cyan-300/10 text-cyan-300",
};

export function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
