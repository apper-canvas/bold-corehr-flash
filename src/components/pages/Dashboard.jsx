import { useState, useEffect } from "react"
import StatCard from "@/components/molecules/StatCard"
import AttendanceCard from "@/components/organisms/AttendanceCard"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import ApperIcon from "@/components/ApperIcon"
import Avatar from "@/components/atoms/Avatar"
import Badge from "@/components/atoms/Badge"
import { employeeService } from "@/services/api/employeeService"
import { attendanceService } from "@/services/api/attendanceService"
import { leaveService } from "@/services/api/leaveService"
import { format } from "date-fns"

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [todayAttendance, setTodayAttendance] = useState([])
  const [pendingLeaves, setPendingLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError("")
    
    try {
      const [employeeStats, attendance, leaves] = await Promise.all([
        employeeService.getStats(),
        attendanceService.getTodayAttendance(),
        leaveService.getPendingRequests()
      ])
      
      setStats(employeeStats)
      setTodayAttendance(attendance)
      setPendingLeaves(leaves)
    } catch (err) {
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadDashboardData} />

  const attendanceRate = todayAttendance.length > 0 
    ? Math.round((todayAttendance.filter(a => a.status === "Present" || a.status === "Clocked In").length / todayAttendance.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Welcome back, Admin!
          </h1>
          <p className="text-slate-600 mt-1">
            Here's what's happening with your team today.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Today</p>
          <p className="text-lg font-semibold text-slate-900">
            {format(new Date(), "EEEE, MMM dd")}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={stats.total}
          icon="Users"
          trend="neutral"
        />
        <StatCard
          title="Active Employees"
          value={stats.active}
          icon="UserCheck"
          trend="up"
        />
        <StatCard
          title="On Leave"
          value={stats.onLeave}
          icon="Calendar"
          trend="neutral"
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon="Clock"
          trend={attendanceRate >= 80 ? "up" : "down"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Clock */}
        <div className="lg:col-span-1">
          <AttendanceCard />
        </div>

        {/* Today's Attendance */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Today's Attendance</h3>
              <ApperIcon name="Clock" size={20} className="text-slate-400" />
            </div>
            
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {todayAttendance.length === 0 ? (
                <div className="text-center py-8">
                  <ApperIcon name="Clock" size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">No attendance records for today</p>
                </div>
              ) : (
                todayAttendance.map((record) => (
                  <div key={record.Id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors duration-200">
                    <div className="flex items-center gap-3">
<Avatar
                      src={record.employee?.avatar_c}
                      fallback={record.employee ? `${record.employee.firstName_c?.[0] || ''}${record.employee.lastName_c?.[0] || ''}` : "??"}
                      alt={record.employee ? `${record.employee.firstName_c || ''} ${record.employee.lastName_c || ''}` : "Unknown"}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-slate-900">
                        {record.employee ? `${record.employee.firstName_c || ''} ${record.employee.lastName_c || ''}` : "Unknown Employee"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {record.clockIn_c ? format(new Date(record.clockIn_c), "h:mm a") : "Not clocked in"}
                      </p>
                    </div>
                  </div>
<div className="text-right">
                    <Badge variant={
                      record.status_c === "Present" ? "success" :
                      record.status_c === "Clocked In" ? "info" :
                      record.status_c === "Absent" ? "error" : "neutral"
                    }>
                      {record.status_c}
                    </Badge>
                    {(record.totalHours_c || 0) > 0 && (
                      <p className="text-sm text-slate-500 mt-1">
                        {record.totalHours_c}h
                      </p>
                    )}
                  </div>
                </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Leave Requests */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Pending Leave Requests</h3>
            <ApperIcon name="Calendar" size={20} className="text-slate-400" />
          </div>
          
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {pendingLeaves.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="Calendar" size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">No pending leave requests</p>
              </div>
            ) : (
              pendingLeaves.slice(0, 5).map((leave) => (
                <div key={leave.Id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors duration-200">
                  <div className="flex items-center gap-3">
<Avatar
                    src={leave.employee?.avatar_c}
                    fallback={leave.employee ? `${leave.employee.firstName_c?.[0] || ''}${leave.employee.lastName_c?.[0] || ''}` : "??"}
                    alt={leave.employee ? `${leave.employee.firstName_c || ''} ${leave.employee.lastName_c || ''}` : "Unknown"}
                    size="sm"
                  />
                  <div>
                    <p className="font-medium text-slate-900">
                      {leave.employee ? `${leave.employee.firstName_c || ''} ${leave.employee.lastName_c || ''}` : "Unknown Employee"}
                    </p>
                    <p className="text-sm text-slate-500">{leave.type_c}</p>
                    <p className="text-xs text-slate-400">
                      {format(new Date(leave.startDate_c), "MMM dd")} - {format(new Date(leave.endDate_c), "MMM dd")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="warning">Pending</Badge>
                  <p className="text-sm text-slate-500 mt-1">
                    {leave.days_c} day{leave.days_c !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              ))
            )}
          </div>
        </div>

        {/* Department Overview */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Department Overview</h3>
            <ApperIcon name="Building2" size={20} className="text-slate-400" />
          </div>
          
          <div className="space-y-4">
            {Object.entries(stats.departmentCounts).map(([department, count]) => (
              <div key={department} className="flex items-center justify-between">
                <span className="text-slate-700">{department}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-slate-900 w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard