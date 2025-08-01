import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"

const Empty = ({ 
  icon = "Inbox",
  title = "No data found", 
  message = "There's nothing to show here yet.",
  action,
  actionLabel = "Get Started",
  className = "" 
}) => {
  return (
    <div className={`card p-8 text-center ${className}`}>
      <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <ApperIcon name={icon} size={32} className="text-slate-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {title}
      </h3>
      
      <p className="text-slate-600 mb-6 max-w-md mx-auto">
        {message}
      </p>
      
      {action && (
        <Button onClick={action} className="mx-auto">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default Empty