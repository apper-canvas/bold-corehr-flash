import { toast } from "react-toastify"
import { employeeService } from "./employeeService"

export const leaveService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "employeeId_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "startDate_c" } },
          { field: { Name: "endDate_c" } },
          { field: { Name: "reason_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "approverId_c" } },
          { field: { Name: "requestDate_c" } },
          { field: { Name: "approvalDate_c" } },
          { field: { Name: "days_c" } }
        ]
      }

      const response = await apperClient.fetchRecords('leave_request_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      const leaveRequests = response.data || []
      
      // Get employee data and attach to leave requests
      const employees = await employeeService.getAll()
      
      return leaveRequests.map(request => {
        const employee = employees.find(emp => emp.Id === (request.employeeId_c?.Id || parseInt(request.employeeId_c)))
        const approver = request.approverId_c ? 
          employees.find(emp => emp.Id === (request.approverId_c?.Id || parseInt(request.approverId_c))) : null
        
        return {
          ...request,
          employee,
          approver
        }
      })
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching leave requests:", error?.response?.data?.message)
      } else {
        console.error(error.message)
      }
      return []
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "employeeId_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "startDate_c" } },
          { field: { Name: "endDate_c" } },
          { field: { Name: "reason_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "approverId_c" } },
          { field: { Name: "requestDate_c" } },
          { field: { Name: "approvalDate_c" } },
          { field: { Name: "days_c" } }
        ]
      }

      const response = await apperClient.getRecordById('leave_request_c', id, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      const request = response.data
      if (!request) return null

      // Get employee data
      const employees = await employeeService.getAll()
      const employee = employees.find(emp => emp.Id === (request.employeeId_c?.Id || parseInt(request.employeeId_c)))
      const approver = request.approverId_c ? 
        employees.find(emp => emp.Id === (request.approverId_c?.Id || parseInt(request.approverId_c))) : null
      
      return {
        ...request,
        employee,
        approver
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching leave request with ID ${id}:`, error?.response?.data?.message)
      } else {
        console.error(error.message)
      }
      return null
    }
  },

  async getByEmployeeId(employeeId) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "employeeId_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "startDate_c" } },
          { field: { Name: "endDate_c" } },
          { field: { Name: "reason_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "approverId_c" } },
          { field: { Name: "requestDate_c" } },
          { field: { Name: "approvalDate_c" } },
          { field: { Name: "days_c" } }
        ],
        where: [
          {
            FieldName: "employeeId_c",
            Operator: "EqualTo",
            Values: [parseInt(employeeId)]
          }
        ]
      }

      const response = await apperClient.fetchRecords('leave_request_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      const employeeRequests = response.data || []
      const employees = await employeeService.getAll()
      
      return employeeRequests.map(request => {
        const employee = employees.find(emp => emp.Id === (request.employeeId_c?.Id || parseInt(request.employeeId_c)))
        const approver = request.approverId_c ? 
          employees.find(emp => emp.Id === (request.approverId_c?.Id || parseInt(request.approverId_c))) : null
        
        return {
          ...request,
          employee,
          approver
        }
      })
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching employee leave requests:", error?.response?.data?.message)
      } else {
        console.error(error.message)
      }
      return []
    }
  },

  async create(requestData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      // Calculate days between start and end date
      const startDate = new Date(requestData.startDate_c)
      const endDate = new Date(requestData.endDate_c)
      const timeDiff = endDate.getTime() - startDate.getTime()
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1

      const params = {
        records: [{
          Name: `Leave Request - ${requestData.type_c}`,
          employeeId_c: parseInt(requestData.employeeId),
          type_c: requestData.type_c,
          startDate_c: requestData.startDate_c,
          endDate_c: requestData.endDate_c,
          reason_c: requestData.reason_c,
          status_c: "Pending",
          requestDate_c: new Date().toISOString(),
          approvalDate_c: null,
          days_c: days,
          approverId_c: requestData.approverId_c ? parseInt(requestData.approverId_c) : null
        }]
      }

      const response = await apperClient.createRecord('leave_request_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create leave request ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) toast.error(record.message)
          })
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating leave request:", error?.response?.data?.message)
      } else {
        console.error(error.message)
      }
      return null
    }
  },

  async update(id, requestData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const updateFields = {
        Id: parseInt(id)
      }

      // Only include updateable fields
      if (requestData.employeeId_c !== undefined) updateFields.employeeId_c = parseInt(requestData.employeeId_c)
      if (requestData.type_c !== undefined) updateFields.type_c = requestData.type_c
      if (requestData.startDate_c !== undefined) updateFields.startDate_c = requestData.startDate_c
      if (requestData.endDate_c !== undefined) updateFields.endDate_c = requestData.endDate_c
      if (requestData.reason_c !== undefined) updateFields.reason_c = requestData.reason_c
      if (requestData.status_c !== undefined) updateFields.status_c = requestData.status_c
      if (requestData.approverId_c !== undefined) updateFields.approverId_c = requestData.approverId_c ? parseInt(requestData.approverId_c) : null
      if (requestData.requestDate_c !== undefined) updateFields.requestDate_c = requestData.requestDate_c
      if (requestData.approvalDate_c !== undefined) updateFields.approvalDate_c = requestData.approvalDate_c
      if (requestData.days_c !== undefined) updateFields.days_c = requestData.days_c

      // Recalculate days if dates are updated
      if (requestData.startDate_c !== undefined || requestData.endDate_c !== undefined) {
        const current = await this.getById(id)
        const startDate = new Date(requestData.startDate_c || current?.startDate_c)
        const endDate = new Date(requestData.endDate_c || current?.endDate_c)
        const timeDiff = endDate.getTime() - startDate.getTime()
        updateFields.days_c = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
      }

      const params = {
        records: [updateFields]
      }

      const response = await apperClient.updateRecord('leave_request_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        const failedUpdates = response.results.filter(result => !result.success)
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update leave request ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`)
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) toast.error(record.message)
          })
        }
        
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating leave request:", error?.response?.data?.message)
      } else {
        console.error(error.message)
      }
      return null
    }
  },

  async approve(id, approverId) {
    try {
      return await this.update(id, {
        status_c: "Approved",
        approverId_c: approverId,
        approvalDate_c: new Date().toISOString()
      })
    } catch (error) {
      console.error("Error approving leave request:", error.message)
      throw error
    }
  },

  async reject(id, approverId) {
    try {
      return await this.update(id, {
        status_c: "Rejected",
        approverId_c: approverId,
        approvalDate_c: new Date().toISOString()
      })
    } catch (error) {
      console.error("Error rejecting leave request:", error.message)
      throw error
    }
  },

  async getPendingRequests() {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "employeeId_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "startDate_c" } },
          { field: { Name: "endDate_c" } },
          { field: { Name: "reason_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "approverId_c" } },
          { field: { Name: "requestDate_c" } },
          { field: { Name: "approvalDate_c" } },
          { field: { Name: "days_c" } }
        ],
        where: [
          {
            FieldName: "status_c",
            Operator: "EqualTo",
            Values: ["Pending"]
          }
        ]
      }

      const response = await apperClient.fetchRecords('leave_request_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      const pending = response.data || []
      const employees = await employeeService.getAll()
      
      return pending.map(request => {
        const employee = employees.find(emp => emp.Id === (request.employeeId_c?.Id || parseInt(request.employeeId_c)))
        return {
          ...request,
          employee
        }
      })
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching pending leave requests:", error?.response?.data?.message)
      } else {
        console.error(error.message)
      }
      return []
    }
  },

  async getLeaveBalance(employeeId) {
    try {
      const employeeRequests = await this.getByEmployeeId(employeeId)
      const approvedRequests = employeeRequests.filter(req => req.status_c === "Approved")
      
      const currentYear = new Date().getFullYear()
      const thisYearRequests = approvedRequests.filter(req => 
        new Date(req.startDate_c).getFullYear() === currentYear
      )
      
      const leaveTypes = {
        "Annual Leave": { total: 25, used: 0 },
        "Sick Leave": { total: 10, used: 0 },
        "Personal Leave": { total: 5, used: 0 },
        "Maternity Leave": { total: 90, used: 0 }
      }
      
      thisYearRequests.forEach(request => {
        if (leaveTypes[request.type_c]) {
          leaveTypes[request.type_c].used += (request.days_c || 0)
        }
      })
      
      Object.keys(leaveTypes).forEach(type => {
        leaveTypes[type].remaining = leaveTypes[type].total - leaveTypes[type].used
      })
      
      return leaveTypes
    } catch (error) {
      console.error("Error getting leave balance:", error.message)
      return {
        "Annual Leave": { total: 25, used: 0, remaining: 25 },
        "Sick Leave": { total: 10, used: 0, remaining: 10 },
        "Personal Leave": { total: 5, used: 0, remaining: 5 },
        "Maternity Leave": { total: 90, used: 0, remaining: 90 }
      }
    }
  },

  async getLeaveStats() {
    try {
      const allRequests = await this.getAll()
      const totalRequests = allRequests.length
      const pending = allRequests.filter(req => req.status_c === "Pending").length
      const approved = allRequests.filter(req => req.status_c === "Approved").length
      const rejected = allRequests.filter(req => req.status_c === "Rejected").length
      
      const typeStats = allRequests.reduce((acc, req) => {
        const type = req.type_c
        if (type) {
          acc[type] = (acc[type] || 0) + 1
        }
        return acc
      }, {})
      
      return {
        totalRequests,
        pending,
        approved,
        rejected,
        typeStats
      }
    } catch (error) {
      console.error("Error getting leave stats:", error.message)
      return {
        totalRequests: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        typeStats: {}
      }
    }
  },

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        RecordIds: [parseInt(id)]
      }

      const response = await apperClient.deleteRecord('leave_request_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        const failedDeletions = response.results.filter(result => !result.success)
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete leave request ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`)
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        return successfulDeletions.length > 0
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting leave request:", error?.response?.data?.message)
      } else {
        console.error(error.message)
      }
      return false
    }
  }
}