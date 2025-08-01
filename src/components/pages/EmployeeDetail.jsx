import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"
import Avatar from "@/components/atoms/Avatar"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import ApperIcon from "@/components/ApperIcon"
import { employeeService } from "@/services/api/employeeService"
import { attendanceService } from "@/services/api/attendanceService"
import { leaveService } from "@/services/api/leaveService"
import { format } from "date-fns"
import { toast } from "react-toastify"

const EmployeeDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [leaveBalance, setLeaveBalance] = useState({})
  const [recentLeaves, setRecentLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (id) {
      loadEmployeeData()
    }
  }, [id])

  const loadEmployeeData = async () => {
    setLoading(true)
    setError("")
    
    try {
      const [empData, attendanceData, leaveBalanceData, leavesData] = await Promise.all([
        employeeService.getById(id),
        attendanceService.getByEmployeeId(id),
        leaveService.getLeaveBalance(id),
        leaveService.getByEmployeeId(id)
      ])
      
      setEmployee(empData)
      setAttendance(attendanceData.slice(0, 10)) // Last 10 records
      setLeaveBalance(leaveBalanceData)
      setRecentLeaves(leavesData.slice(0, 5)) // Last 5 requests
    } catch (err) {
      setError(err.message || "Failed to load employee data")
    } finally {
      setLoading(false)
    }
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case "Active": return "success"
      case "On Leave": return "warning"
      case "Inactive": return "error"
      default: return "neutral"
    }
  }

  const getLeaveStatusVariant = (status) => {
    switch (status) {
      case "Approved": return "success"
      case "Pending": return "warning"
      case "Rejected": return "error"
      default: return "neutral"
    }
  }

  const getAttendanceStatusVariant = (status) => {
    switch (status) {
      case "Present": return "success"
      case "Clocked In": return "info"
      case "Absent": return "error"
      case "On Leave": return "warning"
      default: return "neutral"
    }
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadEmployeeData} />
  if (!employee) return <Error message="Employee not found" />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/employees")}
        >
          <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
          Back to Employees
        </Button>
      </div>

      {/* Employee Info */}
      <div className="card-gradient p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
<Avatar
            src={employee.avatar_c}
            fallback={`${employee.firstName_c?.[0] || ''}${employee.lastName_c?.[0] || ''}`}
            alt={`${employee.firstName_c || ''} ${employee.lastName_c || ''}`}
            size="xl"
          />
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {employee.firstName_c || ''} {employee.lastName_c || ''}
                </h1>
                <p className="text-lg text-slate-600">{employee.role_c}</p>
                <p className="text-sm text-slate-500">{employee.employeeId_c}</p>
              </div>
              <Badge variant={getStatusVariant(employee.status_c)} className="self-start">
                {employee.status_c}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
<div className="flex items-center gap-2">
                <ApperIcon name="Mail" size={16} className="text-slate-400" />
                <span className="text-sm text-slate-600">{employee.email_c}</span>
              </div>
              <div className="flex items-center gap-2">
                <ApperIcon name="Phone" size={16} className="text-slate-400" />
                <span className="text-sm text-slate-600">{employee.phone_c}</span>
              </div>
              <div className="flex items-center gap-2">
                <ApperIcon name="Building2" size={16} className="text-slate-400" />
                <span className="text-sm text-slate-600">{employee.department_c}</span>
              </div>
              <div className="flex items-center gap-2">
                <ApperIcon name="Calendar" size={16} className="text-slate-400" />
                <span className="text-sm text-slate-600">
                  Joined {employee.joinDate_c ? format(new Date(employee.joinDate_c), "MMM dd, yyyy") : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ApperIcon name="DollarSign" size={16} className="text-slate-400" />
                <span className="text-sm text-slate-600">
                  ${employee.salary_c?.toLocaleString() || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ApperIcon name="MapPin" size={16} className="text-slate-400" />
                <span className="text-sm text-slate-600 truncate">{employee.address_c}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Balance */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Leave Balance</h3>
          <div className="space-y-4">
            {Object.entries(leaveBalance).map(([type, balance]) => (
              <div key={type} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{type}</p>
                  <p className="text-sm text-slate-500">
                    {balance.used} used of {balance.total}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600">
                    {balance.remaining}
                  </p>
                  <p className="text-xs text-slate-500">remaining</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Leave Requests */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Leave Requests</h3>
          <div className="space-y-3">
            {recentLeaves.length === 0 ? (
              <div className="text-center py-4">
                <ApperIcon name="Calendar" size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500 text-sm">No leave requests</p>
              </div>
            ) : (
              recentLeaves.map((leave) => (
                <div key={leave.Id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors duration-200">
                  <div>
<p className="font-medium text-slate-900">{leave.type_c}</p>
                      <p className="text-sm text-slate-500">
                        {format(new Date(leave.startDate_c), "MMM dd")} - {format(new Date(leave.endDate_c), "MMM dd")}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={getLeaveStatusVariant(leave.status_c)}>
                        {leave.status_c}
                      </Badge>
                      <p className="text-xs text-slate-500 mt-1">
                        {leave.days_c} day{leave.days_c !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Attendance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Date</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Clock In</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Clock Out</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Hours</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <ApperIcon name="Clock" size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-500">No attendance records</p>
                  </td>
                </tr>
              ) : (
                attendance.map((record) => (
<tr key={record.Id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    {format(new Date(record.date_c), "MMM dd, yyyy")}
                  </td>
                  <td className="py-3 px-4">
                    {record.clockIn_c ? format(new Date(record.clockIn_c), "h:mm a") : "-"}
                  </td>
                  <td className="py-3 px-4">
                    {record.clockOut_c ? format(new Date(record.clockOut_c), "h:mm a") : "-"}
                  </td>
                  <td className="py-3 px-4">
                    {(record.totalHours_c || 0) > 0 ? `${record.totalHours_c}h` : "-"}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={getAttendanceStatusVariant(record.status_c)}>
                      {record.status_c}
                    </Badge>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDetail