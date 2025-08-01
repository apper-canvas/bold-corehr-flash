import leaveRequestsData from "@/services/mockData/leaveRequests.json"
import { employeeService } from "./employeeService"

let leaveRequests = [...leaveRequestsData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const leaveService = {
  async getAll() {
    await delay(300)
    const employees = await employeeService.getAll()
    
    return leaveRequests.map(request => {
      const employee = employees.find(emp => emp.Id === parseInt(request.employeeId))
      const approver = request.approverId ? 
        employees.find(emp => emp.Id === parseInt(request.approverId)) : null
      
      return {
        ...request,
        employee,
        approver
      }
    })
  },

  async getById(id) {
    await delay(200)
    const request = leaveRequests.find(req => req.Id === parseInt(id))
    if (!request) {
      throw new Error("Leave request not found")
    }
    
    const employees = await employeeService.getAll()
    const employee = employees.find(emp => emp.Id === parseInt(request.employeeId))
    const approver = request.approverId ? 
      employees.find(emp => emp.Id === parseInt(request.approverId)) : null
    
    return {
      ...request,
      employee,
      approver
    }
  },

  async getByEmployeeId(employeeId) {
    await delay(300)
    const employeeRequests = leaveRequests.filter(req => req.employeeId === employeeId.toString())
    const employees = await employeeService.getAll()
    
    return employeeRequests.map(request => {
      const employee = employees.find(emp => emp.Id === parseInt(request.employeeId))
      const approver = request.approverId ? 
        employees.find(emp => emp.Id === parseInt(request.approverId)) : null
      
      return {
        ...request,
        employee,
        approver
      }
    })
  },

  async create(requestData) {
    await delay(400)
    const newId = Math.max(...leaveRequests.map(req => req.Id)) + 1
    
    // Calculate days between start and end date
    const startDate = new Date(requestData.startDate)
    const endDate = new Date(requestData.endDate)
    const timeDiff = endDate.getTime() - startDate.getTime()
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
    
    const newRequest = {
      ...requestData,
      Id: newId,
      status: "Pending",
      requestDate: new Date().toISOString(),
      approvalDate: null,
      days
    }
    
    leaveRequests.push(newRequest)
    return { ...newRequest }
  },

  async update(id, requestData) {
    await delay(350)
    const index = leaveRequests.findIndex(req => req.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Leave request not found")
    }
    
    leaveRequests[index] = { ...leaveRequests[index], ...requestData }
    return { ...leaveRequests[index] }
  },

  async approve(id, approverId) {
    await delay(300)
    const index = leaveRequests.findIndex(req => req.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Leave request not found")
    }
    
    leaveRequests[index] = {
      ...leaveRequests[index],
      status: "Approved",
      approverId: approverId.toString(),
      approvalDate: new Date().toISOString()
    }
    
    return { ...leaveRequests[index] }
  },

  async reject(id, approverId) {
    await delay(300)
    const index = leaveRequests.findIndex(req => req.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Leave request not found")
    }
    
    leaveRequests[index] = {
      ...leaveRequests[index],
      status: "Rejected",
      approverId: approverId.toString(),
      approvalDate: new Date().toISOString()
    }
    
    return { ...leaveRequests[index] }
  },

  async getPendingRequests() {
    await delay(250)
    const pending = leaveRequests.filter(req => req.status === "Pending")
    const employees = await employeeService.getAll()
    
    return pending.map(request => {
      const employee = employees.find(emp => emp.Id === parseInt(request.employeeId))
      return {
        ...request,
        employee
      }
    })
  },

  async getLeaveBalance(employeeId) {
    await delay(200)
    const employeeRequests = leaveRequests.filter(req => 
      req.employeeId === employeeId.toString() && 
      req.status === "Approved"
    )
    
    const currentYear = new Date().getFullYear()
    const thisYearRequests = employeeRequests.filter(req => 
      new Date(req.startDate).getFullYear() === currentYear
    )
    
    const leaveTypes = {
      "Annual Leave": { total: 25, used: 0 },
      "Sick Leave": { total: 10, used: 0 },
      "Personal Leave": { total: 5, used: 0 },
      "Maternity Leave": { total: 90, used: 0 }
    }
    
    thisYearRequests.forEach(request => {
      if (leaveTypes[request.type]) {
        leaveTypes[request.type].used += request.days
      }
    })
    
    Object.keys(leaveTypes).forEach(type => {
      leaveTypes[type].remaining = leaveTypes[type].total - leaveTypes[type].used
    })
    
    return leaveTypes
  },

  async getLeaveStats() {
    await delay(300)
    const totalRequests = leaveRequests.length
    const pending = leaveRequests.filter(req => req.status === "Pending").length
    const approved = leaveRequests.filter(req => req.status === "Approved").length
    const rejected = leaveRequests.filter(req => req.status === "Rejected").length
    
    const typeStats = leaveRequests.reduce((acc, req) => {
      acc[req.type] = (acc[req.type] || 0) + 1
      return acc
    }, {})
    
    return {
      totalRequests,
      pending,
      approved,
      rejected,
      typeStats
    }
  },

  async delete(id) {
    await delay(250)
    const index = leaveRequests.findIndex(req => req.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Leave request not found")
    }
    
    leaveRequests.splice(index, 1)
    return true
  }
}