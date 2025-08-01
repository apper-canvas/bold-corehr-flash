import { useState, useEffect } from "react"
import Button from "@/components/atoms/Button"
import SearchBar from "@/components/molecules/SearchBar"
import FilterSelect from "@/components/molecules/FilterSelect"
import EmployeeTable from "@/components/organisms/EmployeeTable"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import ApperIcon from "@/components/ApperIcon"
import { employeeService } from "@/services/api/employeeService"
import { toast } from "react-toastify"

const Employees = () => {
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedRole, setSelectedRole] = useState("")

  useEffect(() => {
    loadEmployees()
    loadFilterOptions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [employees, searchQuery, selectedDepartment, selectedStatus, selectedRole])

  const loadEmployees = async () => {
    setLoading(true)
    setError("")
    
    try {
      const data = await employeeService.getAll()
      setEmployees(data)
    } catch (err) {
      setError(err.message || "Failed to load employees")
    } finally {
      setLoading(false)
    }
  }

  const loadFilterOptions = async () => {
    try {
      const [deptData, roleData] = await Promise.all([
        employeeService.getDepartments(),
        employeeService.getRoles()
      ])
      setDepartments(deptData)
      setRoles(roleData)
    } catch (err) {
      console.error("Failed to load filter options:", err)
    }
  }

  const applyFilters = async () => {
    try {
      const filtered = await employeeService.search(searchQuery, {
        department: selectedDepartment || "all",
        status: selectedStatus || "all",
        role: selectedRole || "all"
      })
      setFilteredEmployees(filtered)
    } catch (err) {
      console.error("Failed to filter employees:", err)
      setFilteredEmployees(employees)
    }
  }

  const handleDelete = async (employeeId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return
    }

    try {
      await employeeService.delete(employeeId)
      await loadEmployees()
      toast.success("Employee deleted successfully!")
    } catch (err) {
      toast.error(err.message || "Failed to delete employee")
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedDepartment("")
    setSelectedStatus("")
    setSelectedRole("")
}
  
  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadEmployees} />

  const departmentOptions = departments.map(dept => ({ value: dept, label: dept }))
  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "On Leave", label: "On Leave" },
    { value: "Inactive", label: "Inactive" }
  ]
  const roleOptions = roles.map(role => ({ value: role, label: role }))
  const hasActiveFilters = searchQuery || selectedDepartment || selectedStatus || selectedRole

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Employees
          </h1>
          <p className="text-slate-600 mt-1">
            Manage your team members and their information
          </p>
        </div>
        <Button>
          <ApperIcon name="UserPlus" size={16} className="mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <SearchBar
              placeholder="Search employees..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          
          <FilterSelect
            label="Department"
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            options={departmentOptions}
            placeholder="All Departments"
          />
          
          <FilterSelect
            label="Status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={statusOptions}
            placeholder="All Status"
          />
          
          <div className="flex items-end">
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                <ApperIcon name="X" size={16} className="mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing {filteredEmployees.length} of {employees.length} employees
          {hasActiveFilters && " (filtered)"}
        </p>
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <ApperIcon name="Filter" size={16} />
            Filters active
          </div>
        )}
      </div>

      {/* Employee Table */}
      {filteredEmployees.length === 0 ? (
        <Empty
          icon="Users"
          title="No employees found"
          message={hasActiveFilters 
            ? "No employees match your current filters. Try adjusting your search criteria."
            : "No employees have been added yet. Start by adding your first team member."
          }
          action={hasActiveFilters ? clearFilters : undefined}
          actionLabel={hasActiveFilters ? "Clear Filters" : "Add Employee"}
        />
      ) : (
        <EmployeeTable
          employees={filteredEmployees}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default Employees