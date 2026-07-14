import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-cyan-300 text-[#0B192C] hover:bg-cyan-200 disabled:bg-cyan-300/60",
  secondary:
    "border border-cyan-300/40 text-cyan-300 hover:bg-cyan-300/10 disabled:text-cyan-300/50",
  ghost:
    "border border-white/20 text-white hover:border-cyan-300 hover:bg-white/10 disabled:text-white/50",
  danger:
    "bg-red-500 text-white hover:bg-red-400 disabled:bg-red-500/60",
};

export function Button({
  type = "button",
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
