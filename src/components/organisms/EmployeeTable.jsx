import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Avatar from "@/components/atoms/Avatar"
import Badge from "@/components/atoms/Badge"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import { format } from "date-fns"

const EmployeeTable = ({ employees, onEdit, onDelete }) => {
const navigate = useNavigate()
  const [sortField, setSortField] = useState("firstName")
  const [sortDirection, setSortDirection] = useState("asc")
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

const sortedEmployees = [...employees].sort((a, b) => {
    let fieldName = sortField
    if (sortField === "firstName") fieldName = "firstName_c"
    if (sortField === "department") fieldName = "department_c"
    if (sortField === "role") fieldName = "role_c"
    if (sortField === "joinDate") fieldName = "joinDate_c"
    if (sortField === "status") fieldName = "status_c"
    
    let aValue = a[fieldName]
    let bValue = b[fieldName]

    if (sortField === "joinDate") {
      aValue = aValue ? new Date(aValue) : new Date(0)
      bValue = bValue ? new Date(bValue) : new Date(0)
    }

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase()
      bValue = (bValue || "").toLowerCase()
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const getStatusVariant = (status) => {
    switch (status) {
      case "Active": return "success"
      case "On Leave": return "warning"
      case "Inactive": return "error"
      default: return "neutral"
    }
  }

  const SortHeader = ({ field, children }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors duration-200"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ApperIcon 
          name={sortField === field && sortDirection === "desc" ? "ChevronDown" : "ChevronUp"} 
          size={12}
          className={sortField === field ? "text-primary-600" : "text-slate-400"}
        />
      </div>
    </th>
  )

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Employee
              </th>
              <SortHeader field="department">Department</SortHeader>
              <SortHeader field="role">Role</SortHeader>
              <SortHeader field="joinDate">Join Date</SortHeader>
              <SortHeader field="status">Status</SortHeader>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {sortedEmployees.map((employee) => (
              <tr 
                key={employee.Id} 
                className="hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                onClick={() => navigate(`/employees/${employee.Id}`)}
              >
<td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar
                      src={employee.avatar_c}
                      fallback={`${employee.firstName_c?.[0] || ''}${employee.lastName_c?.[0] || ''}`}
                      alt={`${employee.firstName_c || ''} ${employee.lastName_c || ''}`}
                      size="md"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900">
                        {employee.firstName_c || ''} {employee.lastName_c || ''}
                      </div>
                      <div className="text-sm text-slate-500">{employee.email_c}</div>
                      <div className="text-xs text-slate-400">{employee.employeeId_c}</div>
                    </div>
                  </div>
                </td>
<td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">{employee.department_c}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">{employee.role_c}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">
                    {employee.joinDate_c ? format(new Date(employee.joinDate_c), "MMM dd, yyyy") : "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getStatusVariant(employee.status_c)}>
                    {employee.status_c}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/employees/${employee.Id}`)
                      }}
                    >
                      <ApperIcon name="Eye" size={16} />
                    </Button>
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(employee)
                        }}
                      >
                        <ApperIcon name="Edit" size={16} />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(employee.Id)
                        }}
                      >
                        <ApperIcon name="Trash2" size={16} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default EmployeeTable