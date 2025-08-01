import { cn } from "@/utils/cn"
import Label from "@/components/atoms/Label"

const FilterSelect = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = "Select option",
  className 
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default FilterSelect