import { useState, useEffect } from "react"
import Button from "@/components/atoms/Button"
import Avatar from "@/components/atoms/Avatar"
import FormField from "@/components/molecules/FormField"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import ApperIcon from "@/components/ApperIcon"
import { employeeService } from "@/services/api/employeeService"
import { leaveService } from "@/services/api/leaveService"
import { format } from "date-fns"
import { toast } from "react-toastify"

const Profile = () => {
  const [employee, setEmployee] = useState(null)
  const [leaveBalance, setLeaveBalance] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})

  // Using employee ID "1" as current user for demo
  const currentUserId = "1"

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    setLoading(true)
    setError("")
    
    try {
      const [empData, balance] = await Promise.all([
        employeeService.getById(currentUserId),
        leaveService.getLeaveBalance(currentUserId)
      ])
      
      setEmployee(empData)
      setLeaveBalance(balance)
      setFormData({
        firstName: empData.firstName,
        lastName: empData.lastName,
        email: empData.email,
        phone: empData.phone,
        address: empData.address,
        emergencyContact: empData.emergencyContact
      })
    } catch (err) {
      setError(err.message || "Failed to load profile data")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      await employeeService.update(currentUserId, formData)
      await loadProfileData()
      setIsEditing(false)
      toast.success("Profile updated successfully!")
    } catch (err) {
      toast.error(err.message || "Failed to update profile")
    }
  }

  const handleCancel = () => {
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      address: employee.address,
      emergencyContact: employee.emergencyContact
    })
    setIsEditing(false)
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadProfileData} />
  if (!employee) return <Error message="Profile not found" />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-slate-600 mt-1">
            Manage your personal information and preferences
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <ApperIcon name="Edit" size={16} className="mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center gap-6 mb-6">
              <Avatar
                src={employee.avatar}
                fallback={`${employee.firstName[0]}${employee.lastName[0]}`}
                alt={`${employee.firstName} ${employee.lastName}`}
                size="xl"
              />
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {employee.firstName} {employee.lastName}
                </h2>
                <p className="text-slate-600">{employee.role}</p>
                <p className="text-sm text-slate-500">{employee.employeeId}</p>
                <div className="flex items-center gap-2 mt-2">
                  <ApperIcon name="Calendar" size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-500">
                    Joined {format(new Date(employee.joinDate), "MMMM yyyy")}
                  </span>
                </div>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    required
                  />
                  <FormField
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                  <FormField
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                  />
                </div>
                
                <FormField
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
                
                <FormField
                  label="Emergency Contact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleChange("emergencyContact", e.target.value)}
                />
                
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} className="flex-1">
                    <ApperIcon name="Check" size={16} className="mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="secondary" onClick={handleCancel} className="flex-1">
                    <ApperIcon name="X" size={16} className="mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ApperIcon name="Mail" size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-600">{employee.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ApperIcon name="Phone" size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-600">{employee.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ApperIcon name="MapPin" size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-600">{employee.address}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Work Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ApperIcon name="Building2" size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-600">{employee.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ApperIcon name="Briefcase" size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-600">{employee.role}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ApperIcon name="Phone" size={16} className="text-slate-400" />
                        <span className="text-sm text-slate-600">Emergency: {employee.emergencyContact}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leave Balance */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Leave Balance</h3>
            <div className="space-y-4">
              {Object.entries(leaveBalance).map(([type, balance]) => (
                <div key={type} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-slate-900">{type}</span>
                    <span className="text-lg font-bold text-primary-600">
                      {balance.remaining}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mb-2">
                    {balance.used} used of {balance.total} days
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(balance.used / balance.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ApperIcon name="Calendar" size={16} className="text-slate-400" />
                  <span className="text-sm text-slate-600">Years with Company</span>
                </div>
                <span className="font-semibold text-slate-900">
                  {Math.floor((new Date() - new Date(employee.joinDate)) / (365.25 * 24 * 60 * 60 * 1000))} years
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ApperIcon name="DollarSign" size={16} className="text-slate-400" />
                  <span className="text-sm text-slate-600">Annual Salary</span>
                </div>
                <span className="font-semibold text-slate-900">
                  ${employee.salary?.toLocaleString() || "N/A"}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ApperIcon name="CheckCircle" size={16} className="text-slate-400" />
                  <span className="text-sm text-slate-600">Status</span>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  {employee.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile