type FormMessageVariant = "success" | "error" | "info";

type FormMessageProps = {
  message: string;
  variant?: FormMessageVariant;
};

const variantClasses: Record<FormMessageVariant, string> = {
  success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  error: "border-red-400/30 bg-red-400/10 text-red-300",
  info: "border-cyan-300/30 bg-cyan-300/10 text-cyan-300",
};

export function FormMessage({
  message,
  variant = "info",
}: FormMessageProps) {
  return (
    <p
      className={`rounded-lg border px-4 py-3 text-sm ${variantClasses[variant]}`}
    >
      {message}
    </p>
  );
}
