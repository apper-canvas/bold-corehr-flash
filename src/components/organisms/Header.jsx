import { useState, useContext } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import ApperIcon from "@/components/ApperIcon"
import Avatar from "@/components/atoms/Avatar"
import Button from "@/components/atoms/Button"
import { AuthContext } from "@/App"

const Header = ({ onMenuToggle }) => {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const navigate = useNavigate()
  const { logout } = useContext(AuthContext)
  const { user, isAuthenticated } = useSelector((state) => state.user)
  return (
    <header className="bg-white border-b border-slate-200 px-4 lg:px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuToggle}
          className="lg:hidden"
        >
          <ApperIcon name="Menu" size={20} />
        </Button>
        
        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            CoreHR Dashboard
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="relative">
          <ApperIcon name="Bell" size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>

<div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2"
          >
            <Avatar
              src={user?.avatar_c || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"}
              alt="User Avatar"
              size="sm"
            />
            <span className="hidden sm:block text-sm font-medium">
              {isAuthenticated && user ? 
                (user.firstName && user.lastName ? 
                  `${user.firstName} ${user.lastName}` : 
                  user.emailAddress || 'User'
                ) : 
                'User'
              }
            </span>
            <ApperIcon name="ChevronDown" size={16} />
          </Button>

{showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
              <button 
                onClick={() => {
                  navigate('/profile')
                  setShowUserMenu(false)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Profile Settings
              </button>
              <button 
                onClick={() => setShowUserMenu(false)}
                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Preferences
              </button>
              <hr className="my-1" />
              <button 
                onClick={() => {
                  logout()
                  setShowUserMenu(false)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header