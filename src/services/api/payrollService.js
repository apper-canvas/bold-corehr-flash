import payrollData from "@/services/mockData/payroll.json"
import { employeeService } from "./employeeService"

let payroll = [...payrollData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const payrollService = {
  async getAll() {
    await delay(300)
    const employees = await employeeService.getAll()
    
    return payroll.map(record => {
      const employee = employees.find(emp => emp.Id === parseInt(record.employeeId))
      return {
        ...record,
        employee
      }
    })
  },

  async getById(id) {
    await delay(200)
    const record = payroll.find(pay => pay.Id === parseInt(id))
    if (!record) {
      throw new Error("Payroll record not found")
    }
    
    const employees = await employeeService.getAll()
    const employee = employees.find(emp => emp.Id === parseInt(record.employeeId))
    
    return {
      ...record,
      employee
    }
  },

  async getByEmployeeId(employeeId, year) {
    await delay(300)
    let employeePayroll = payroll.filter(pay => pay.employeeId === employeeId.toString())
    
    if (year) {
      employeePayroll = employeePayroll.filter(pay => pay.month.startsWith(year.toString()))
    }
    
    const employees = await employeeService.getAll()
    const employee = employees.find(emp => emp.Id === parseInt(employeeId))
    
    return employeePayroll.map(record => ({
      ...record,
      employee
    }))
  },

  async create(payrollData) {
    await delay(400)
    const newId = Math.max(...payroll.map(pay => pay.Id)) + 1
    
    const newRecord = {
      ...payrollData,
      Id: newId,
      netSalary: payrollData.basicSalary + payrollData.allowances - payrollData.deductions
    }
    
    payroll.push(newRecord)
    return { ...newRecord }
  },

  async update(id, payrollData) {
    await delay(350)
    const index = payroll.findIndex(pay => pay.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Payroll record not found")
    }
    
    const updatedRecord = {
      ...payroll[index],
      ...payrollData,
      netSalary: (payrollData.basicSalary || payroll[index].basicSalary) + 
                 (payrollData.allowances || payroll[index].allowances) - 
                 (payrollData.deductions || payroll[index].deductions)
    }
    
    payroll[index] = updatedRecord
    return { ...updatedRecord }
  },

  async delete(id) {
    await delay(250)
    const index = payroll.findIndex(pay => pay.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Payroll record not found")
    }
    
    payroll.splice(index, 1)
    return true
  },

  async getCurrentMonthPayroll() {
    await delay(300)
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
    const currentPayroll = payroll.filter(pay => pay.month === currentMonth)
    
    const employees = await employeeService.getAll()
    
    return currentPayroll.map(record => {
      const employee = employees.find(emp => emp.Id === parseInt(record.employeeId))
      return {
        ...record,
        employee
      }
    })
  },

  async getPayrollStats(month) {
    await delay(300)
    let targetPayroll = payroll
    
    if (month) {
      targetPayroll = payroll.filter(pay => pay.month === month)
    }
    
    const totalEmployees = targetPayroll.length
    const totalGrossSalary = targetPayroll.reduce((sum, pay) => sum + pay.basicSalary + pay.allowances, 0)
    const totalNetSalary = targetPayroll.reduce((sum, pay) => sum + pay.netSalary, 0)
    const totalDeductions = targetPayroll.reduce((sum, pay) => sum + pay.deductions, 0)
    const totalOvertime = targetPayroll.reduce((sum, pay) => sum + (pay.overtimePay || 0), 0)
    const totalTax = targetPayroll.reduce((sum, pay) => sum + (pay.taxDeduction || 0), 0)
    
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
  },

  async generatePayslip(employeeId, month) {
    await delay(400)
    const record = payroll.find(pay => 
      pay.employeeId === employeeId.toString() && 
      pay.month === month
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
  },

  async getAvailableMonths() {
    await delay(200)
    const months = [...new Set(payroll.map(pay => pay.month))]
    return months.sort().reverse()
  },

  async getSalaryHistory(employeeId) {
    await delay(300)
    const history = payroll
      .filter(pay => pay.employeeId === employeeId.toString())
      .sort((a, b) => new Date(b.month) - new Date(a.month))
    
    const employees = await employeeService.getAll()
    const employee = employees.find(emp => emp.Id === parseInt(employeeId))
    
    return history.map(record => ({
      ...record,
      employee
    }))
  }
}