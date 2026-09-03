import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-xl border-[0.5px] border-[#0A0A0A]/10 bg-white px-3.5 py-2 text-xs font-arabic text-[#0A0A0A] transition-colors outline-none",
        "placeholder:text-[#0A0A0A]/40 selection:bg-[#C8FF00] selection:text-[#0A0A0A]",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-[#0A0A0A]",
        "hover:border-[#0A0A0A]/30 focus-visible:border-[#0A0A0A]/30 focus-visible:ring-2 focus-visible:ring-[#C8FF00]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-[#D9381E] aria-invalid:ring-2 aria-invalid:ring-[#D9381E]/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
