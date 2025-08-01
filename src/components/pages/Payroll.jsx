import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { payrollService } from "@/services/api/payrollService";
import ApperIcon from "@/components/ApperIcon";
import FilterSelect from "@/components/molecules/FilterSelect";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Employees from "@/components/pages/Employees";
import Button from "@/components/atoms/Button";
import Avatar from "@/components/atoms/Avatar";

const Payroll = () => {
  const [payrollRecords, setPayrollRecords] = useState([])
  const [availableMonths, setAvailableMonths] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [showPayslipModal, setShowPayslipModal] = useState(false)
  const [selectedPayslip, setSelectedPayslip] = useState(null)

  useEffect(() => {
    loadPayrollData()
    loadAvailableMonths()
  }, [])

  useEffect(() => {
    if (selectedMonth) {
      loadMonthlyPayroll()
    } else {
      loadPayrollData()
    }
  }, [selectedMonth])

  const loadPayrollData = async () => {
    setLoading(true)
    setError("")
    
    try {
      const [records, payrollStats] = await Promise.all([
        payrollService.getCurrentMonthPayroll(),
        payrollService.getPayrollStats()
      ])
      
      setPayrollRecords(records)
      setStats(payrollStats)
    } catch (err) {
      setError(err.message || "Failed to load payroll data")
    } finally {
      setLoading(false)
    }
  }

  const loadMonthlyPayroll = async () => {
    setLoading(true)
    setError("")
    
    try {
      const [records, payrollStats] = await Promise.all([
        payrollService.getAll(),
        payrollService.getPayrollStats(selectedMonth)
      ])
      
      const filteredRecords = selectedMonth 
        ? records.filter(record => record.month === selectedMonth)
        : records
      
      setPayrollRecords(filteredRecords)
      setStats(payrollStats)
    } catch (err) {
      setError(err.message || "Failed to load payroll data")
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableMonths = async () => {
    try {
      const months = await payrollService.getAvailableMonths()
      setAvailableMonths(months)
      if (months.length > 0) {
        setSelectedMonth(months[0]) // Select current month by default
      }
    } catch (err) {
      console.error("Failed to load available months:", err)
    }
  }

  const handleGeneratePayslip = async (employeeId, month) => {
    try {
      const payslip = await payrollService.generatePayslip(employeeId, month)
      setSelectedPayslip(payslip)
      setShowPayslipModal(true)
      toast.success("Payslip generated successfully!")
    } catch (err) {
      toast.error(err.message || "Failed to generate payslip")
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split("-")
    return format(new Date(year, month - 1), "MMMM yyyy")
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadPayrollData} />

  const monthOptions = availableMonths.map(month => ({
    value: month,
    label: formatMonth(month)
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Payroll Management
          </h1>
          <p className="text-slate-600 mt-1">
            Manage employee salaries and payslips
          </p>
        </div>
        <div className="flex items-center gap-3">
          <FilterSelect
            value={selectedMonth}
            onChange={setSelectedMonth}
            options={monthOptions}
            placeholder="Select Month"
            className="min-w-[180px]"
          />
          <Button variant="outline">
            <ApperIcon name="Download" size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-gradient p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Total Employees</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {stats.totalEmployees}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl">
                <ApperIcon name="Users" size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="card-gradient p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Gross Salary</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  {formatCurrency(stats.totalGrossSalary)}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <ApperIcon name="TrendingUp" size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="card-gradient p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Net Salary</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  {formatCurrency(stats.totalNetSalary)}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <ApperIcon name="DollarSign" size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="card-gradient p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Deductions</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  {formatCurrency(stats.totalDeductions)}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                <ApperIcon name="Minus" size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            Payroll for {selectedMonth ? formatMonth(selectedMonth) : "Current Month"}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          {payrollRecords.length === 0 ? (
            <div className="p-8">
              <Empty
                icon="DollarSign"
                title="No payroll records"
                message="No payroll data available for the selected period."
              />
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Basic Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Allowances
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Net Salary
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {payrollRecords.map((record) => (
                  <tr key={record.Id} className="hover:bg-slate-50 transition-colors duration-200">
<td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar
                          src={record.employee?.avatar_c}
                          fallback={record.employee ? `${record.employee.firstName_c?.[0] || ''}${record.employee.lastName_c?.[0] || ''}` : "??"}
                          alt={record.employee ? `${record.employee.firstName_c || ''} ${record.employee.lastName_c || ''}` : "Unknown"}
                          size="sm"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-slate-900">
                            {record.employee ? `${record.employee.firstName_c || ''} ${record.employee.lastName_c || ''}` : "Unknown Employee"}
                          </div>
                          <div className="text-sm text-slate-500">
                            {record.employee?.department_c}
                          </div>
                        </div>
                      </div>
                    </td>
<td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {formatCurrency(record.basicSalary_c || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-green-600 font-medium">
                        +{formatCurrency(record.allowances_c || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-red-600 font-medium">
                        -{formatCurrency(record.deductions_c || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">
                        {formatCurrency(record.netSalary_c || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGeneratePayslip(record.employeeId_c?.Id || record.employeeId_c, record.month_c)}
                      >
                        <ApperIcon name="FileText" size={14} className="mr-1" />
                        Payslip
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Payslip Modal */}
      {showPayslipModal && selectedPayslip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Payslip</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPayslipModal(false)}
                >
                  <ApperIcon name="X" size={16} />
                </Button>
              </div>
              
              {/* Payslip Content */}
              <div className="space-y-6">
                <div className="text-center border-b border-slate-200 pb-4">
                  <h2 className="text-xl font-bold text-slate-900">CoreHR</h2>
                  <p className="text-slate-600">Employee Management Platform</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Payslip for {formatMonth(selectedPayslip.month)}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Employee Details</h4>
<div className="space-y-1 text-sm text-slate-600">
                      <p><span className="font-medium">Name:</span> {selectedPayslip.employee.firstName_c} {selectedPayslip.employee.lastName_c}</p>
                      <p><span className="font-medium">ID:</span> {selectedPayslip.employee.employeeId_c}</p>
                      <p><span className="font-medium">Department:</span> {selectedPayslip.employee.department_c}</p>
                      <p><span className="font-medium">Role:</span> {selectedPayslip.employee.role_c}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Payslip Details</h4>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p><span className="font-medium">Payslip ID:</span> {selectedPayslip.payslipId}</p>
                      <p><span className="font-medium">Period:</span> {formatMonth(selectedPayslip.month)}</p>
                      <p><span className="font-medium">Generated:</span> {format(new Date(selectedPayslip.generatedDate), "MMM dd, yyyy")}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Earnings</h4>
                    <div className="space-y-2">
<div className="flex justify-between text-sm">
                        <span>Basic Salary</span>
                        <span className="font-medium">{formatCurrency(selectedPayslip.record.basicSalary_c || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Allowances</span>
                        <span className="font-medium text-green-600">{formatCurrency(selectedPayslip.record.allowances_c || 0)}</span>
                      </div>
                      {(selectedPayslip.record.overtimePay_c || 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Overtime Pay</span>
                          <span className="font-medium text-green-600">{formatCurrency(selectedPayslip.record.overtimePay_c || 0)}</span>
                        </div>
                      )}
                      <div className="border-t border-slate-200 pt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Gross Salary</span>
                          <span>{formatCurrency((selectedPayslip.record.basicSalary_c || 0) + (selectedPayslip.record.allowances_c || 0) + (selectedPayslip.record.overtimePay_c || 0))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Deductions</h4>
<div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tax Deduction</span>
                        <span className="font-medium text-red-600">{formatCurrency(selectedPayslip.record.taxDeduction_c || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Insurance</span>
                        <span className="font-medium text-red-600">{formatCurrency(selectedPayslip.record.insuranceDeduction_c || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Provident Fund</span>
                        <span className="font-medium text-red-600">{formatCurrency(selectedPayslip.record.providentFund_c || 0)}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total Deductions</span>
                          <span className="text-red-600">{formatCurrency(selectedPayslip.record.deductions_c || 0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Net Salary</span>
                    <span className="text-primary-600">{formatCurrency(selectedPayslip.record.netSalary_c || 0)}</span>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button className="flex-1">
                    <ApperIcon name="Download" size={16} className="mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <ApperIcon name="Printer" size={16} className="mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payroll