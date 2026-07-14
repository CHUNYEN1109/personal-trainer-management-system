import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({
  id,
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-medium text-white"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        className={`w-full rounded-lg border border-white/10 bg-[#0B192C] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#66758F] focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20 ${className}`}
        {...props}
      />

      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
    </div>
  );
}
