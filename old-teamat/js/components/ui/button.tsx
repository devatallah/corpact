import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold font-arabic transition-all duration-150 cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#C8FF00] focus-visible:ring-offset-1 aria-invalid:border-[#D9381E]",
  {
    variants: {
      variant: {
        default:
          "bg-[#0A0A0A] text-white border-[0.5px] border-[#0A0A0A] hover:bg-[#0A0A0A]/90",
        accent:
          "bg-[#C8FF00] text-[#0A0A0A] border-[0.5px] border-[#C8FF00] hover:bg-[#BCF200]",
        destructive:
          "bg-[#D9381E] text-white border-[0.5px] border-[#D9381E] hover:bg-[#D9381E]/90 focus-visible:ring-[#D9381E]/40",
        outline:
          "border-[0.5px] border-[#0A0A0A]/10 bg-white text-[#0A0A0A] hover:border-[#0A0A0A]/30 hover:bg-[#F6F8F5]",
        secondary:
          "bg-[#F6F8F5] text-[#0A0A0A] border-[0.5px] border-[#0A0A0A]/10 hover:bg-[#0A0A0A]/5",
        ghost: "text-[#0A0A0A] hover:bg-[#0A0A0A]/5",
        link: "text-[#0A0A0A] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 text-xs has-[>svg]:px-3.5",
        sm: "h-8 px-3 text-[11px] has-[>svg]:px-2.5",
        lg: "h-10 px-6 text-sm has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
