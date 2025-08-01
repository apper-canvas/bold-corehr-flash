import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const StatCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  trend = "neutral",
  className 
}) => {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-slate-600"
  }

  const trendIcons = {
    up: "TrendingUp",
    down: "TrendingDown",
    neutral: "Minus"
  }

  return (
    <div className={cn("card-gradient p-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            {value}
          </p>
          {change && (
            <div className={cn("flex items-center mt-2 text-sm", trendColors[trend])}>
              <ApperIcon name={trendIcons[trend]} size={16} className="mr-1" />
              {change}
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
            <ApperIcon name={icon} size={24} className="text-white" />
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard