import { toast } from "react-toastify"
import { employeeService } from "./employeeService"

export const payrollService = {
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
          { field: { Name: "month_c" } },
          { field: { Name: "basicSalary_c" } },
          { field: { Name: "allowances_c" } },
          { field: { Name: "deductions_c" } },
          { field: { Name: "netSalary_c" } },
          { field: { Name: "overtimeHours_c" } },
          { field: { Name: "overtimePay_c" } },
          { field: { Name: "taxDeduction_c" } },
          { field: { Name: "insuranceDeduction_c" } },
          { field: { Name: "providentFund_c" } }
        ]
      }

      const response = await apperClient.fetchRecords('payroll_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      const payrollRecords = response.data || []
      
      // Get employee data and attach to payroll records
      const employees = await employeeService.getAll()
      
      return payrollRecords.map(record => {
        const employee = employees.find(emp => emp.Id === (record.employeeId_c?.Id || parseInt(record.employeeId_c)))
        return {
          ...record,
          employee
        }
      })
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching payroll records:", error?.response?.data?.message)
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
          { field: { Name: "month_c" } },
          { field: { Name: "basicSalary_c" } },
          { field: { Name: "allowances_c" } },
          { field: { Name: "deductions_c" } },
          { field: { Name: "netSalary_c" } },
          { field: { Name: "overtimeHours_c" } },
          { field: { Name: "overtimePay_c" } },
          { field: { Name: "taxDeduction_c" } },
          { field: { Name: "insuranceDeduction_c" } },
          { field: { Name: "providentFund_c" } }
        ]
      }

      const response = await apperClient.getRecordById('payroll_c', id, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      const record = response.data
      if (!record) return null

      // Get employee data
      const employees = await employeeService.getAll()
      const employee = employees.find(emp => emp.Id === (record.employeeId_c?.Id || parseInt(record.employeeId_c)))
      
      return {
        ...record,
        employee
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching payroll record with ID ${id}:`, error?.response?.data?.message)
      } else {
        console.error(error.message)
      }
      return null
    }
  },

  async create(payrollData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const netSalary = (payrollData.basicSalary_c || 0) + (payrollData.allowances_c || 0) - (payrollData.deductions_c || 0)

      const params = {
        records: [{
          Name: `Payroll - ${payrollData.month_c}`,
          employeeId_c: parseInt(payrollData.employeeId_c),
          month_c: payrollData.month_c,
          basicSalary_c: payrollData.basicSalary_c,
          allowances_c: payrollData.allowances_c || 0,
          deductions_c: payrollData.deductions_c || 0,
          netSalary_c: netSalary,
          overtimeHours_c: payrollData.overtimeHours_c || 0,
          overtimePay_c: payrollData.overtimePay_c || 0,
          taxDeduction_c: payrollData.taxDeduction_c || 0,
          insuranceDeduction_c: payrollData.insuranceDeduction_c || 0,
          providentFund_c: payrollData.providentFund_c || 0
        }]
      }

      const response = await apperClient.createRecord('payroll_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create payroll record ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          
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
        console.error("Error creating payroll record:", error?.response?.data?.message)
      } else {
        console.error(error.message)
      }
      return null
    }
  },

  async update(id, payrollData) {
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
      if (payrollData.employeeId_c !== undefined) updateFields.employeeId_c = parseInt(payrollData.employeeId_c)
      if (payrollData.month_c !== undefined) updateFields.month_c = payrollData.month_c
      if (payrollData.basicSalary_c !== undefined) updateFields.basicSalary_c = payrollData.basicSalary_c
      if (payrollData.allowances_c !== undefined) updateFields.allowances_c = payrollData.allowances_c
      if (payrollData.deductions_c !== undefined) updateFields.deductions_c = payrollData.deductions_c
      if (payrollData.overtimeHours_c !== undefined) updateFields.overtimeHours_c = payrollData.overtimeHours_c
      if (payrollData.overtimePay_c !== undefined) updateFields.overtimePay_c = payrollData.overtimePay_c
      if (payrollData.taxDeduction_c !== undefined) updateFields.taxDeduction_c = payrollData.taxDeduction_c
      if (payrollData.insuranceDeduction_c !== undefined) updateFields.insuranceDeduction_c = payrollData.insuranceDeduction_c
      if (payrollData.providentFund_c !== undefined) updateFields.providentFund_c = payrollData.providentFund_c

      // Calculate net salary if any salary components are updated
      if (payrollData.basicSalary_c !== undefined || payrollData.allowances_c !== undefined || payrollData.deductions_c !== undefined) {
        const current = await this.getById(id)
        const basicSalary = payrollData.basicSalary_c !== undefined ? payrollData.basicSalary_c : (current?.basicSalary_c || 0)
        const allowances = payrollData.allowances_c !== undefined ? payrollData.allowances_c : (current?.allowances_c || 0)
        const deductions = payrollData.deductions_c !== undefined ? payrollData.deductions_c : (current?.deductions_c || 0)
        updateFields.netSalary_c = basicSalary + allowances - deductions
      }

      const params = {
        records: [updateFields]
      }

      const response = await apperClient.updateRecord('payroll_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        const failedUpdates = response.results.filter(result => !result.success)
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update payroll record ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`)
          
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
        console.error("Error updating payroll record:", error?.response?.data?.message)
      } else {
        console.error(error.message)
      }
      return null
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

      const response = await apperClient.deleteRecord('payroll_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        const failedDeletions = response.results.filter(result => !result.success)
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete payroll record ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`)
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        return successfulDeletions.length > 0
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting payroll record:", error?.response?.data?.message)
      } else {
        console.error(error.message)
      }
      return false
    }
  },

  async getCurrentMonthPayroll() {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
      const allRecords = await this.getAll()
      return allRecords.filter(record => record.month_c === currentMonth)
    } catch (error) {
      console.error("Error getting current month payroll:", error.message)
      return []
    }
  },

  async getPayrollStats(month) {
    try {
      let targetPayroll = await this.getAll()
      
      if (month) {
        targetPayroll = targetPayroll.filter(record => record.month_c === month)
      }
      
      const totalEmployees = targetPayroll.length
      const totalGrossSalary = targetPayroll.reduce((sum, pay) => sum + (pay.basicSalary_c || 0) + (pay.allowances_c || 0), 0)
      const totalNetSalary = targetPayroll.reduce((sum, pay) => sum + (pay.netSalary_c || 0), 0)
      const totalDeductions = targetPayroll.reduce((sum, pay) => sum + (pay.deductions_c || 0), 0)
      const totalOvertime = targetPayroll.reduce((sum, pay) => sum + (pay.overtimePay_c || 0), 0)
      const totalTax = targetPayroll.reduce((sum, pay) => sum + (pay.taxDeduction_c || 0), 0)
      
      const avgSalary = totalEmployees > 0 ? totalNetSalary / totalEmployees : 0
      
      return {
        totalEmployees,
        totalGrossSalary,
        totalNetSalary,
        totalDeductions,
        totalOvertime,
        totalTax,
        avgSalary: Math.round(avgSalary * 100) / 100
      }
    } catch (error) {
      console.error("Error getting payroll stats:", error.message)
      return {
        totalEmployees: 0,
        totalGrossSalary: 0,
        totalNetSalary: 0,
        totalDeductions: 0,
        totalOvertime: 0,
        totalTax: 0,
        avgSalary: 0
      }
    }
  },

  async generatePayslip(employeeId, month) {
    try {
      const allRecords = await this.getAll()
      const record = allRecords.find(pay => 
        (pay.employeeId_c?.Id || parseInt(pay.employeeId_c)) === parseInt(employeeId) && 
        pay.month_c === month
      )
      
      if (!record) {
        throw new Error("Payroll record not found for the specified month")
      }
      
      const employees = await employeeService.getAll()
      const employee = employees.find(emp => emp.Id === parseInt(employeeId))
      
      if (!employee) {
        throw new Error("Employee not found")
      }
      
      return {
        payslipId: `PS-${record.Id}-${month.replace("-", "")}`,
        employee,
        record,
        generatedDate: new Date().toISOString(),
        month
      }
    } catch (error) {
      console.error("Error generating payslip:", error.message)
      throw error
    }
  },

  async getAvailableMonths() {
    try {
      const allRecords = await this.getAll()
      const months = [...new Set(allRecords.map(pay => pay.month_c).filter(Boolean))]
      return months.sort().reverse()
    } catch (error) {
      console.error("Error getting available months:", error.message)
      return []
    }
  },

  async getSalaryHistory(employeeId) {
    try {
      const allRecords = await this.getAll()
      const history = allRecords
        .filter(pay => (pay.employeeId_c?.Id || parseInt(pay.employeeId_c)) === parseInt(employeeId))
        .sort((a, b) => new Date(b.month_c) - new Date(a.month_c))
      
      return history
    } catch (error) {
      console.error("Error getting salary history:", error.message)
      return []
    }
  }
}