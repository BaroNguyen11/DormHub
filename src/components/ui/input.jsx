import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-md border-3 border-line bg-surface",
        "px-4 py-2.5 text-base font-(family-name:--font-family-body) text-(--color-text)",
        "transition-all duration-150 outline-none! shadow-[2px_2px_0_rgba(0,0,0,0.1)]",
        "placeholder:text-text-subtle",
        "hover:border-line-strong",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-3 disabled:opacity-50",
        "aria-invalid:border-error aria-invalid:shadow-[4px_4px_0_rgba(255,51,102,0.25)]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
