import { forwardRef } from "react"
import { cn } from "@/utils/cn"

const Button = forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  children, 
  ...props 
}, ref) => {
  const baseClasses = "btn"
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "border border-primary-300 text-primary-700 hover:bg-primary-50",
    ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
  }
  const sizeClasses = {
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg"
  }

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = "Button"

export default Button