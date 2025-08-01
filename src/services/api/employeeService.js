import employeesData from "@/services/mockData/employees.json"

let employees = [...employeesData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const employeeService = {
  async getAll() {
    await delay(300)
    return [...employees]
  },

  async getById(id) {
    await delay(200)
    const employee = employees.find(emp => emp.Id === parseInt(id))
    if (!employee) {
      throw new Error("Employee not found")
    }
    return { ...employee }
  },

  async create(employeeData) {
    await delay(400)
    const newId = Math.max(...employees.map(emp => emp.Id)) + 1
    const newEmployee = {
      ...employeeData,
      Id: newId,
      employeeId: `EMP${newId.toString().padStart(3, "0")}`,
      joinDate: new Date().toISOString(),
      status: "Active"
    }
    employees.push(newEmployee)
    return { ...newEmployee }
  },

  async update(id, employeeData) {
    await delay(350)
    const index = employees.findIndex(emp => emp.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Employee not found")
    }
    employees[index] = { ...employees[index], ...employeeData }
    return { ...employees[index] }
  },

  async delete(id) {
    await delay(250)
    const index = employees.findIndex(emp => emp.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Employee not found")
    }
    employees.splice(index, 1)
    return true
  },

  async search(query, filters = {}) {
    await delay(250)
    let filtered = [...employees]

    if (query) {
      const searchTerm = query.toLowerCase()
      filtered = filtered.filter(emp => 
        emp.firstName.toLowerCase().includes(searchTerm) ||
        emp.lastName.toLowerCase().includes(searchTerm) ||
        emp.email.toLowerCase().includes(searchTerm) ||
        emp.employeeId.toLowerCase().includes(searchTerm)
      )
    }

    if (filters.department && filters.department !== "all") {
      filtered = filtered.filter(emp => emp.department === filters.department)
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter(emp => emp.status === filters.status)
    }

    if (filters.role && filters.role !== "all") {
      filtered = filtered.filter(emp => emp.role === filters.role)
    }

    return filtered
  },

  async getDepartments() {
    await delay(100)
    const departments = [...new Set(employees.map(emp => emp.department))]
    return departments.sort()
  },

  async getRoles() {
    await delay(100)
    const roles = [...new Set(employees.map(emp => emp.role))]
    return roles.sort()
  },

  async getStats() {
    await delay(200)
    const total = employees.length
    const active = employees.filter(emp => emp.status === "Active").length
    const onLeave = employees.filter(emp => emp.status === "On Leave").length
    const inactive = employees.filter(emp => emp.status === "Inactive").length

    const departmentCounts = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1
      return acc
    }, {})

    return {
      total,
      active,
      onLeave,
      inactive,
      departmentCounts
    }
  }
}