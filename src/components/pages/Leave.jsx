import { useState, useEffect } from "react"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"
import Avatar from "@/components/atoms/Avatar"
import LeaveRequestForm from "@/components/organisms/LeaveRequestForm"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { leaveService } from "@/services/api/leaveService"
import { format } from "date-fns"
import { toast } from "react-toastify"

const Leave = () => {
  const [leaveRequests, setLeaveRequests] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [leaveBalance, setLeaveBalance] = useState({})
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [activeTab, setActiveTab] = useState("requests")

  useEffect(() => {
    loadLeaveData()
  }, [])

  const loadLeaveData = async () => {
    setLoading(true)
    setError("")
    
    try {
      const [allRequests, pending, balance, leaveStats] = await Promise.all([
        leaveService.getAll(),
        leaveService.getPendingRequests(),
        leaveService.getLeaveBalance("1"), // Current user
        leaveService.getLeaveStats()
      ])
      
      setLeaveRequests(allRequests)
      setPendingRequests(pending)
      setLeaveBalance(balance)
      setStats(leaveStats)
    } catch (err) {
      setError(err.message || "Failed to load leave data")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId) => {
    try {
      await leaveService.approve(requestId, "1") // Current user as approver
      await loadLeaveData()
      toast.success("Leave request approved!")
    } catch (err) {
      toast.error(err.message || "Failed to approve request")
    }
  }

  const handleReject = async (requestId) => {
    try {
      await leaveService.reject(requestId, "1") // Current user as approver
      await loadLeaveData()
      toast.success("Leave request rejected!")
    } catch (err) {
      toast.error(err.message || "Failed to reject request")
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

  const getLeaveStatusIcon = (status) => {
    switch (status) {
      case "Approved": return "CheckCircle"
      case "Pending": return "Clock"
      case "Rejected": return "XCircle"
      default: return "Calendar"
    }
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadLeaveData} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Leave Management
          </h1>
          <p className="text-slate-600 mt-1">
            Manage leave requests and track balances
          </p>
        </div>
        <Button onClick={() => setShowRequestForm(true)}>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Request Leave
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-gradient p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Total Requests</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {stats.totalRequests}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl">
                <ApperIcon name="Calendar" size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="card-gradient p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Pending</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                  {stats.pending}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl">
                <ApperIcon name="Clock" size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="card-gradient p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Approved</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  {stats.approved}
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
                <p className="text-sm font-medium text-slate-600 mb-2">Rejected</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  {stats.rejected}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                <ApperIcon name="XCircle" size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("requests")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === "requests"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              All Requests
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === "pending"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Pending Approval
              {pendingRequests.length > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("balance")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === "balance"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Leave Balance
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "requests" && (
            <div className="space-y-4">
              {leaveRequests.length === 0 ? (
                <Empty
                  icon="Calendar"
                  title="No leave requests"
                  message="No leave requests have been submitted yet."
                />
              ) : (
                leaveRequests.map((request) => (
                  <div key={request.Id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-colors duration-200">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={request.employee?.avatar}
                        fallback={request.employee ? `${request.employee.firstName[0]}${request.employee.lastName[0]}` : "??"}
                        alt={request.employee ? `${request.employee.firstName} ${request.employee.lastName}` : "Unknown"}
                        size="md"
                      />
                      <div>
                        <p className="font-medium text-slate-900">
                          {request.employee ? `${request.employee.firstName} ${request.employee.lastName}` : "Unknown Employee"}
                        </p>
                        <p className="text-sm text-slate-600">{request.type}</p>
                        <p className="text-sm text-slate-500">
                          {format(new Date(request.startDate), "MMM dd")} - {format(new Date(request.endDate), "MMM dd, yyyy")}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 max-w-md truncate">
                          {request.reason}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge variant={getLeaveStatusVariant(request.status)}>
                        <ApperIcon name={getLeaveStatusIcon(request.status)} size={12} className="mr-1" />
                        {request.status}
                      </Badge>
                      <p className="text-sm text-slate-500 mt-1">
                        {request.days} day{request.days !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-slate-400">
                        {format(new Date(request.requestDate), "MMM dd")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "pending" && (
            <div className="space-y-4">
              {pendingRequests.length === 0 ? (
                <Empty
                  icon="Clock"
                  title="No pending requests"
                  message="All leave requests have been reviewed."
                />
              ) : (
                pendingRequests.map((request) => (
                  <div key={request.Id} className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={request.employee?.avatar}
                        fallback={request.employee ? `${request.employee.firstName[0]}${request.employee.lastName[0]}` : "??"}
                        alt={request.employee ? `${request.employee.firstName} ${request.employee.lastName}` : "Unknown"}
                        size="md"
                      />
                      <div>
                        <p className="font-medium text-slate-900">
                          {request.employee ? `${request.employee.firstName} ${request.employee.lastName}` : "Unknown Employee"}
                        </p>
                        <p className="text-sm text-slate-600">{request.type}</p>
                        <p className="text-sm text-slate-500">
                          {format(new Date(request.startDate), "MMM dd")} - {format(new Date(request.endDate), "MMM dd, yyyy")}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 max-w-md">
                          {request.reason}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.Id)}
                      >
                        <ApperIcon name="Check" size={14} className="mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(request.Id)}
                      >
                        <ApperIcon name="X" size={14} className="mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "balance" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(leaveBalance).map(([type, balance]) => (
                <div key={type} className="card-gradient p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-900">{type}</h4>
                    <ApperIcon name="Calendar" size={20} className="text-slate-400" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total Allocated</span>
                      <span className="font-medium">{balance.total} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Used</span>
                      <span className="font-medium text-red-600">{balance.used} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Remaining</span>
                      <span className="font-medium text-green-600">{balance.remaining} days</span>
                    </div>
                    
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
                      <div 
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(balance.used / balance.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Leave Request Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Request Leave</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRequestForm(false)}
                >
                  <ApperIcon name="X" size={16} />
                </Button>
              </div>
              
              <LeaveRequestForm
                onSuccess={() => {
                  setShowRequestForm(false)
                  loadLeaveData()
                }}
                onCancel={() => setShowRequestForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leave