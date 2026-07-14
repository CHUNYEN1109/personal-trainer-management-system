import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-[#1A1A1A]/80 p-6 shadow-2xl shadow-black/30 backdrop-blur ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
