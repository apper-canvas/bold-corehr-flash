import { forwardRef } from "react"
import { cn } from "@/utils/cn"

const Badge = forwardRef(({ className, variant = "neutral", ...props }, ref) => {
  const variantClasses = {
    success: "badge-success",
    warning: "badge-warning",
    error: "badge-error",
    info: "badge-info",
    neutral: "badge-neutral"
  }

  return (
    <span
      ref={ref}
      className={cn("badge", variantClasses[variant], className)}
      {...props}
    />
  )
})

Badge.displayName = "Badge"

export default Badge