import { forwardRef } from "react"
import { cn } from "@/utils/cn"
import ApperIcon from "@/components/ApperIcon"

const Avatar = forwardRef(({ 
  className, 
  src, 
  alt, 
  fallback, 
  size = "md",
  ...props 
}, ref) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg"
  }

  if (src) {
    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn(
          "rounded-full object-cover border-2 border-slate-200",
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {fallback || <ApperIcon name="User" size={size === "sm" ? 12 : size === "md" ? 16 : size === "lg" ? 20 : 24} />}
    </div>
  )
})

Avatar.displayName = "Avatar"

export default Avatar