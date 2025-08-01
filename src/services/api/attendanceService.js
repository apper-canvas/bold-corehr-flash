import { toast } from "react-toastify"
import { employeeService } from "./employeeService"

export const attendanceService = {
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
          { field: { Name: "date_c" } },
          { field: { Name: "clockIn_c" } },
          { field: { Name: "clockOut_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "totalHours_c" } },
          { field: { Name: "breakMinutes_c" } }
        ]
      }

      const response = await apperClient.fetchRecords('attendance_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data || []
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching attendance records:", error?.response?.data?.message)
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
          { field: { Name: "date_c" } },
          { field: { Name: "clockIn_c" } },
          { field: { Name: "clockOut_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "totalHours_c" } },
          { field: { Name: "breakMinutes_c" } }
        ]
      }

      const response = await apperClient.getRecordById('attendance_c', id, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      return response.data
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching attendance record with ID ${id}:`, error?.response?.data?.message)
      } else {
        console.error(error.message)
      }
      return null
    }
  },

  async getByEmployeeId(employeeId, startDate, endDate) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const where = [
        {
          FieldName: "employeeId_c",
          Operator: "EqualTo",
          Values: [parseInt(employeeId)]
        }
      ]

      if (startDate) {
        where.push({
          FieldName: "date_c",
          Operator: "GreaterThanOrEqualTo",
          Values: [startDate]
        })
      }

      if (endDate) {
        where.push({
          FieldName: "date_c",
          Operator: "LessThanOrEqualTo",
          Values: [endDate]
        })
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "employeeId_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "clockIn_c" } },
          { field: { Name: "clockOut_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "totalHours_c" } },
          { field: { Name: "breakMinutes_c" } }
        ],
        where: where
      }

      const response = await apperClient.fetchRecords('attendance_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data || []
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching employee attendance:", error?.response?.data?.message)
      } else {
        console.error(error.message)
      }
      return []
    }
  },

  async clockIn(employeeId) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const today = new Date().toISOString().split("T")[0] + "T00:00:00.000Z"
      const now = new Date().toISOString()
      
      // Check if already clocked in today
      const existingRecords = await this.getByEmployeeId(employeeId, today, today)
      const existingRecord = existingRecords.find(att => att.clockIn_c && !att.clockOut_c)
      
      if (existingRecord) {
        throw new Error("Already clocked in today")
      }

      const params = {
        records: [{
          Name: `Attendance - ${new Date().toLocaleDateString()}`,
          employeeId_c: parseInt(employeeId),
          date_c: today,
          clockIn_c: now,
          clockOut_c: null,
          status_c: "Clocked In",
          totalHours_c: 0,
          breakMinutes_c: 0
        }]
      }

      const response = await apperClient.createRecord('attendance_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to clock in ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          
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
        console.error(`Attendance Service - Error clocking in: ${error?.response?.data?.message}`)
      } else {
        console.error(`Attendance Service - Clock in error: ${error.message}`)
      }
      throw error
    }
  },

  async clockOut(employeeId) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const today = new Date().toISOString().split("T")[0] + "T00:00:00.000Z"
      const now = new Date().toISOString()
      
      // Find today's clock-in record
      const todayRecords = await this.getByEmployeeId(employeeId, today, today)
      const clockedInRecord = todayRecords.find(att => att.clockIn_c && !att.clockOut_c)
      
      if (!clockedInRecord) {
        throw new Error("No clock-in record found for today")
      }

      const clockInTime = new Date(clockedInRecord.clockIn_c)
      const clockOutTime = new Date(now)
      const totalHours = (clockOutTime - clockInTime) / (1000 * 60 * 60) - ((clockedInRecord.breakMinutes_c || 0) / 60)

      const params = {
        records: [{
          Id: clockedInRecord.Id,
          clockOut_c: now,
          status_c: "Present",
          totalHours_c: Math.round(totalHours * 100) / 100
        }]
      }

      const response = await apperClient.updateRecord('attendance_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        const failedUpdates = response.results.filter(result => !result.success)
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to clock out ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`)
          
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
        console.error(`Attendance Service - Error clocking out: ${error?.response?.data?.message}`)
      } else {
        console.error(`Attendance Service - Clock out error: ${error.message}`)
      }
      throw error
    }
  },

  async getTodayAttendance() {
    try {
      const today = new Date().toISOString().split("T")[0] + "T00:00:00.000Z"
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "employeeId_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "clockIn_c" } },
          { field: { Name: "clockOut_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "totalHours_c" } },
          { field: { Name: "breakMinutes_c" } }
        ],
        where: [
          {
            FieldName: "date_c",
            Operator: "EqualTo",
            Values: [today]
          }
        ]
      }

      const response = await apperClient.fetchRecords('attendance_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      const todayRecords = response.data || []
      
      // Get employee data and attach to attendance records
      const employees = await employeeService.getAll()
      const attendanceWithEmployee = todayRecords.map(record => {
        const employee = employees.find(emp => emp.Id === (record.employeeId_c?.Id || parseInt(record.employeeId_c)))
        return {
          ...record,
          employee
        }
      })
      
      return attendanceWithEmployee
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching today's attendance:", error?.response?.data?.message)
      } else {
        console.error(error.message)
      }
      return []
    }
  },

  async getAttendanceStats(startDate, endDate) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const where = []

      if (startDate) {
        where.push({
          FieldName: "date_c",
          Operator: "GreaterThanOrEqualTo",
          Values: [startDate]
        })
      }

      if (endDate) {
        where.push({
          FieldName: "date_c",
          Operator: "LessThanOrEqualTo",
          Values: [endDate]
        })
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "employeeId_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "clockIn_c" } },
          { field: { Name: "clockOut_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "totalHours_c" } },
          { field: { Name: "breakMinutes_c" } }
        ],
        where: where
      }

      const response = await apperClient.fetchRecords('attendance_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return {}
      }

      const filtered = response.data || []
      
      const totalRecords = filtered.length
      const presentRecords = filtered.filter(att => att.status_c === "Present").length
      const absentRecords = filtered.filter(att => att.status_c === "Absent").length
      const onLeaveRecords = filtered.filter(att => att.status_c === "On Leave").length
      const clockedInRecords = filtered.filter(att => att.status_c === "Clocked In").length
      
      const averageHours = filtered
        .filter(att => (att.totalHours_c || 0) > 0)
        .reduce((sum, att) => sum + (att.totalHours_c || 0), 0) / 
        filtered.filter(att => (att.totalHours_c || 0) > 0).length || 0
      
      return {
        totalRecords,
        presentRecords,
        absentRecords,
        onLeaveRecords,
        clockedInRecords,
        averageHours: Math.round(averageHours * 100) / 100,
        attendanceRate: totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching attendance stats:", error?.response?.data?.message)
      } else {
        console.error(error.message)
      }
      return {}
    }
  },

  async getEmployeeCurrentStatus(employeeId) {
    try {
      const today = new Date().toISOString().split("T")[0] + "T00:00:00.000Z"
      const todayRecords = await this.getByEmployeeId(employeeId, today, today)
      const todayRecord = todayRecords.find(att => att.date_c === today)
      
      if (!todayRecord) {
        return { status: "Not Clocked In", clockIn: null, clockOut: null, totalHours: 0 }
      }
      
      return {
        status: todayRecord.status_c || "Not Clocked In",
        clockIn: todayRecord.clockIn_c,
        clockOut: todayRecord.clockOut_c,
        totalHours: todayRecord.totalHours_c || 0
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching employee current status:", error?.response?.data?.message)
      } else {
        console.error(error.message)
      }
      return { status: "Not Clocked In", clockIn: null, clockOut: null, totalHours: 0 }
    }
  }
}