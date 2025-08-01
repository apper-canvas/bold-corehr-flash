import Label from "@/components/atoms/Label"
import Input from "@/components/atoms/Input"
import { cn } from "@/utils/cn"

const FormField = ({ 
  label, 
  error, 
  className, 
  children, 
  required = false,
  ...props 
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className={required ? "after:content-['*'] after:text-red-500 after:ml-1" : ""}>
          {label}
        </Label>
      )}
      {children || <Input {...props} />}
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}

export default FormField