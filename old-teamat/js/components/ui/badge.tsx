import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border-[0.5px] px-2 py-0.5 text-[11px] font-medium font-arabic w-fit whitespace-nowrap shrink-0 select-none [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-[#0A0A0A] text-white border-[#0A0A0A] [a&]:hover:bg-[#0A0A0A]/90",
        accent:
          "bg-[#C8FF00] text-[#0A0A0A] border-[#C8FF00] font-extrabold [a&]:hover:bg-[#BCF200]",
        secondary:
          "bg-[#F6F8F5] text-[#0A0A0A] border-[#0A0A0A]/10 [a&]:hover:bg-[#0A0A0A]/5",
        success: "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold",
        warning: "bg-[#FEF08A] text-[#C87D00] border-[#C87D00]/20 font-bold",
        destructive:
          "bg-[#FDEDEC] text-[#D9381E] border-[#D9381E]/20 font-bold [a&]:hover:bg-[#FDEDEC]/80",
        outline:
          "text-[#0A0A0A] border-[#0A0A0A]/10 [a&]:hover:border-[#0A0A0A]/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
