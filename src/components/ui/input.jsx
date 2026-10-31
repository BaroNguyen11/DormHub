import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-[var(--radius-md)] border-3 border-[#333333] bg-white",
        "px-4 py-2.5 text-base font-[family-name:var(--font-family-body)] text-[var(--color-text)]",
        "transition-all duration-150 outline-none shadow-[2px_2px_0_rgba(0,0,0,0.1)]",
        "placeholder:text-[var(--color-text-subtle)]",
        "hover:border-[#555555]",
        "focus-visible:border-[#00d2ff] focus-visible:shadow-[4px_4px_0_rgba(0,0,0,0.25)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#f3f4f6] disabled:opacity-50",
        "aria-invalid:border-[#ff3366] aria-invalid:shadow-[4px_4px_0_rgba(255,51,102,0.25)]",
        className
      )}
      {...props} />
  );
}

export { Input }
