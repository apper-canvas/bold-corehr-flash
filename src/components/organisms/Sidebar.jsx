import { NavLink, useLocation } from "react-router-dom"
import ApperIcon from "@/components/ApperIcon"
import { cn } from "@/utils/cn"

const navigation = [
  { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
  { name: "Employees", href: "/employees", icon: "Users" },
  { name: "Attendance", href: "/attendance", icon: "Clock" },
  { name: "Leave", href: "/leave", icon: "Calendar" },
  { name: "Payroll", href: "/payroll", icon: "DollarSign" },
  { name: "Profile", href: "/profile", icon: "User" }
]

const Sidebar = ({ className, onItemClick }) => {
  const location = useLocation()

  return (
    <div className={cn("flex flex-col h-full bg-white border-r border-slate-200", className)}>
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
            <ApperIcon name="Building2" size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              CoreHR
            </h2>
            <p className="text-xs text-slate-500">Employee Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== "/" && location.pathname.startsWith(item.href))
            
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <ApperIcon name={item.icon} size={20} />
                  {item.name}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg">
          <p className="text-xs font-medium text-slate-600 mb-1">Need Help?</p>
          <p className="text-xs text-slate-500">Contact support for assistance</p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar