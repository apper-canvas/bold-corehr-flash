import { useState, useEffect } from "react"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import { attendanceService } from "@/services/api/attendanceService"
import { toast } from "react-toastify"
import { format } from "date-fns"

const AttendanceCard = ({ employeeId = "1" }) => {
  const [currentStatus, setCurrentStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCurrentStatus()
  }, [employeeId])

  const loadCurrentStatus = async () => {
    try {
      const status = await attendanceService.getEmployeeCurrentStatus(employeeId)
      setCurrentStatus(status)
    } catch (error) {
      console.error("Error loading attendance status:", error)
    }
  }

  const handleClockIn = async () => {
    setLoading(true)
    try {
      await attendanceService.clockIn(employeeId)
      await loadCurrentStatus()
      toast.success("Clocked in successfully!")
    } catch (error) {
      toast.error(error.message || "Failed to clock in")
    } finally {
      setLoading(false)
    }
  }

  const handleClockOut = async () => {
    setLoading(true)
    try {
      await attendanceService.clockOut(employeeId)
      await loadCurrentStatus()
      toast.success("Clocked out successfully!")
    } catch (error) {
      toast.error(error.message || "Failed to clock out")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = () => {
    switch (currentStatus?.status) {
      case "Clocked In": return "text-green-600"
      case "Present": return "text-blue-600"
      case "Absent": return "text-red-600"
      default: return "text-slate-600"
    }
  }

  const getStatusIcon = () => {
    switch (currentStatus?.status) {
      case "Clocked In": return "Clock"
      case "Present": return "CheckCircle"
      case "Absent": return "XCircle"
      default: return "Clock"
    }
  }

  if (!currentStatus) {
    return (
      <div className="card-gradient p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-slate-200 rounded w-1/2 mb-4"></div>
          <div className="h-10 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card-gradient p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Today's Attendance</h3>
          <div className="flex items-center gap-2">
            <ApperIcon name={getStatusIcon()} size={20} className={getStatusColor()} />
            <span className={`font-medium ${getStatusColor()}`}>
              {currentStatus.status === "Not Clocked In" ? "Ready to Clock In" : currentStatus.status}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">
            {format(new Date(), "MMM dd, yyyy")}
          </p>
          <p className="text-lg font-semibold text-slate-900">
            {format(new Date(), "h:mm a")}
          </p>
        </div>
      </div>

      {currentStatus.clockIn && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Clock In</p>
            <p className="text-lg font-semibold text-green-700">
              {format(new Date(currentStatus.clockIn), "h:mm a")}
            </p>
          </div>
          {currentStatus.clockOut && (
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Clock Out</p>
              <p className="text-lg font-semibold text-blue-700">
                {format(new Date(currentStatus.clockOut), "h:mm a")}
              </p>
            </div>
          )}
        </div>
      )}

      {currentStatus.totalHours > 0 && (
        <div className="text-center p-3 bg-slate-50 rounded-lg mb-6">
          <p className="text-sm text-slate-600 font-medium">Total Hours</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            {currentStatus.totalHours}h
          </p>
        </div>
      )}

      <div className="flex gap-3">
        {currentStatus.status === "Not Clocked In" || currentStatus.status === "Absent" ? (
          <Button
            onClick={handleClockIn}
            disabled={loading}
            className="flex-1"
            size="lg"
          >
            <ApperIcon name="Clock" size={20} className="mr-2" />
            {loading ? "Clocking In..." : "Clock In"}
          </Button>
        ) : currentStatus.status === "Clocked In" ? (
          <Button
            onClick={handleClockOut}
            disabled={loading}
            variant="secondary"
            className="flex-1"
            size="lg"
          >
            <ApperIcon name="Clock" size={20} className="mr-2" />
            {loading ? "Clocking Out..." : "Clock Out"}
          </Button>
        ) : (
          <div className="flex-1 text-center py-3 text-slate-500">
            <ApperIcon name="CheckCircle" size={20} className="mx-auto mb-2 text-green-500" />
            <p className="text-sm">Attendance completed for today</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AttendanceCard