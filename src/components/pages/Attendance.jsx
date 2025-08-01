import { useState, useEffect } from "react"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"
import Avatar from "@/components/atoms/Avatar"
import AttendanceCard from "@/components/organisms/AttendanceCard"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { attendanceService } from "@/services/api/attendanceService"
import { format, startOfWeek, endOfWeek } from "date-fns"

const Attendance = () => {
  const [todayAttendance, setTodayAttendance] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    loadAttendanceData()
  }, [])

  const loadAttendanceData = async () => {
    setLoading(true)
    setError("")
    
    try {
      const [attendance, weekStats] = await Promise.all([
        attendanceService.getTodayAttendance(),
        attendanceService.getAttendanceStats(
          startOfWeek(new Date()).toISOString(),
          endOfWeek(new Date()).toISOString()
        )
      ])
      
      setTodayAttendance(attendance)
      setStats(weekStats)
    } catch (err) {
      setError(err.message || "Failed to load attendance data")
    } finally {
      setLoading(false)
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "Present": return "CheckCircle"
      case "Clocked In": return "Clock"
      case "Absent": return "XCircle"
      case "On Leave": return "Calendar"
      default: return "Clock"
    }
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadAttendanceData} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Attendance Management
          </h1>
          <p className="text-slate-600 mt-1">
            Track and manage employee attendance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input"
          />
          <Button variant="outline">
            <ApperIcon name="Download" size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-gradient p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Present Today</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  {stats.presentRecords}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <ApperIcon name="CheckCircle" size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="card-gradient p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Clocked In</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  {stats.clockedInRecords}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <ApperIcon name="Clock" size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="card-gradient p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">On Leave</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                  {stats.onLeaveRecords}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl">
                <ApperIcon name="Calendar" size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="card-gradient p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Attendance Rate</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  {stats.attendanceRate}%
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <ApperIcon name="TrendingUp" size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clock In/Out Widget */}
        <div className="lg:col-span-1">
          <AttendanceCard />
        </div>

        {/* Today's Attendance */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Today's Attendance ({format(new Date(), "MMM dd, yyyy")})
              </h3>
              <Button
                variant="ghost"
                onClick={loadAttendanceData}
              >
                <ApperIcon name="RefreshCw" size={16} />
              </Button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {todayAttendance.length === 0 ? (
                <Empty
                  icon="Clock"
                  title="No attendance records"
                  message="No employees have clocked in today yet."
                />
              ) : (
                todayAttendance.map((record) => (
<div key={record.Id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-colors duration-200">
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={record.employee?.avatar_c}
                      fallback={record.employee ? `${record.employee.firstName_c?.[0] || ''}${record.employee.lastName_c?.[0] || ''}` : "??"}
                      alt={record.employee ? `${record.employee.firstName_c || ''} ${record.employee.lastName_c || ''}` : "Unknown"}
                      size="md"
                    />
                    <div>
                      <p className="font-medium text-slate-900">
                        {record.employee ? `${record.employee.firstName_c || ''} ${record.employee.lastName_c || ''}` : "Unknown Employee"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {record.employee?.department_c} • {record.employee?.role_c}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <ApperIcon name="LogIn" size={12} />
                          {record.clockIn_c ? format(new Date(record.clockIn_c), "h:mm a") : "-"}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <ApperIcon name="LogOut" size={12} />
                          {record.clockOut_c ? format(new Date(record.clockOut_c), "h:mm a") : "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                    
<div className="text-right">
                    <Badge variant={getAttendanceStatusVariant(record.status_c)}>
                      <ApperIcon name={getStatusIcon(record.status_c)} size={12} className="mr-1" />
                      {record.status_c}
                    </Badge>
                    {(record.totalHours_c || 0) > 0 && (
                      <p className="text-sm text-slate-600 mt-1 font-medium">
                        {record.totalHours_c}h worked
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

      {/* Additional Stats */}
      {stats && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Weekly Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{stats.totalRecords}</p>
              <p className="text-sm text-slate-600">Total Records</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{stats.averageHours}h</p>
              <p className="text-sm text-slate-600">Average Hours</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{stats.absentRecords}</p>
              <p className="text-sm text-slate-600">Absent Days</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Attendance