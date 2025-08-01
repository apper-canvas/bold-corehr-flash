import { useState } from "react"
import Input from "@/components/atoms/Input"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const SearchBar = ({ 
  placeholder = "Search...", 
  onSearch, 
  className,
  value,
  onChange
}) => {
  const [searchTerm, setSearchTerm] = useState(value || "")

  const handleSearch = () => {
    onSearch?.(searchTerm)
  }

  const handleChange = (e) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    onChange?.(newValue)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className={cn("relative flex items-center", className)}>
      <div className="relative flex-1">
        <ApperIcon 
          name="Search" 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" 
          size={16} 
        />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          className="pl-10"
        />
      </div>
      {onSearch && (
        <Button 
          onClick={handleSearch}
          className="ml-2"
          size="sm"
        >
          Search
        </Button>
      )}
    </div>
  )
}

export default SearchBar