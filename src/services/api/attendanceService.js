import attendanceData from "@/services/mockData/attendance.json"
import { employeeService } from "./employeeService"

let attendance = [...attendanceData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const attendanceService = {
  async getAll() {
    await delay(300)
    return [...attendance]
  },

  async getById(id) {
    await delay(200)
    const record = attendance.find(att => att.Id === parseInt(id))
    if (!record) {
      throw new Error("Attendance record not found")
    }
    return { ...record }
  },

  async getByEmployeeId(employeeId, startDate, endDate) {
    await delay(300)
    let filtered = attendance.filter(att => att.employeeId === employeeId.toString())
    
    if (startDate) {
      filtered = filtered.filter(att => new Date(att.date) >= new Date(startDate))
    }
    
    if (endDate) {
      filtered = filtered.filter(att => new Date(att.date) <= new Date(endDate))
    }
    
    return filtered
  },

  async clockIn(employeeId) {
    await delay(400)
    const today = new Date().toISOString().split("T")[0] + "T00:00:00.000Z"
    const now = new Date().toISOString()
    
    // Check if already clocked in today
    const existingRecord = attendance.find(att => 
      att.employeeId === employeeId.toString() && 
      att.date === today
    )
    
    if (existingRecord && existingRecord.clockIn) {
      throw new Error("Already clocked in today")
    }
    
    const newId = Math.max(...attendance.map(att => att.Id)) + 1
    const newRecord = {
      Id: newId,
      employeeId: employeeId.toString(),
      date: today,
      clockIn: now,
      clockOut: null,
      status: "Clocked In",
      totalHours: 0,
      breakMinutes: 0
    }
    
    if (existingRecord) {
      const index = attendance.findIndex(att => att.Id === existingRecord.Id)
      attendance[index] = { ...existingRecord, ...newRecord, Id: existingRecord.Id }
      return { ...attendance[index] }
    } else {
      attendance.push(newRecord)
      return { ...newRecord }
    }
  },

  async clockOut(employeeId) {
    await delay(400)
    const today = new Date().toISOString().split("T")[0] + "T00:00:00.000Z"
    const now = new Date().toISOString()
    
    const recordIndex = attendance.findIndex(att => 
      att.employeeId === employeeId.toString() && 
      att.date === today &&
      att.clockIn && !att.clockOut
    )
    
    if (recordIndex === -1) {
      throw new Error("No clock-in record found for today")
    }
    
    const record = attendance[recordIndex]
    const clockInTime = new Date(record.clockIn)
    const clockOutTime = new Date(now)
    const totalHours = (clockOutTime - clockInTime) / (1000 * 60 * 60) - (record.breakMinutes / 60)
    
    attendance[recordIndex] = {
      ...record,
      clockOut: now,
      status: "Present",
      totalHours: Math.round(totalHours * 100) / 100
    }
    
    return { ...attendance[recordIndex] }
  },

  async getTodayAttendance() {
    await delay(300)
    const today = new Date().toISOString().split("T")[0] + "T00:00:00.000Z"
    const todayRecords = attendance.filter(att => att.date === today)
    
    const employees = await employeeService.getAll()
    const attendanceWithEmployee = todayRecords.map(record => {
      const employee = employees.find(emp => emp.Id === parseInt(record.employeeId))
      return {
        ...record,
        employee
      }
    })
    
    return attendanceWithEmployee
  },

  async getAttendanceStats(startDate, endDate) {
    await delay(300)
    let filtered = [...attendance]
    
    if (startDate) {
      filtered = filtered.filter(att => new Date(att.date) >= new Date(startDate))
    }
    
    if (endDate) {
      filtered = filtered.filter(att => new Date(att.date) <= new Date(endDate))
    }
    
    const totalRecords = filtered.length
    const presentRecords = filtered.filter(att => att.status === "Present").length
    const absentRecords = filtered.filter(att => att.status === "Absent").length
    const onLeaveRecords = filtered.filter(att => att.status === "On Leave").length
    const clockedInRecords = filtered.filter(att => att.status === "Clocked In").length
    
    const averageHours = filtered
      .filter(att => att.totalHours > 0)
      .reduce((sum, att) => sum + att.totalHours, 0) / 
      filtered.filter(att => att.totalHours > 0).length || 0
    
    return {
      totalRecords,
      presentRecords,
      absentRecords,
      onLeaveRecords,
      clockedInRecords,
      averageHours: Math.round(averageHours * 100) / 100,
      attendanceRate: totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0
    }
  },

  async getEmployeeCurrentStatus(employeeId) {
    await delay(200)
    const today = new Date().toISOString().split("T")[0] + "T00:00:00.000Z"
    const todayRecord = attendance.find(att => 
      att.employeeId === employeeId.toString() && 
      att.date === today
    )
    
    if (!todayRecord) {
      return { status: "Not Clocked In", clockIn: null, clockOut: null, totalHours: 0 }
    }
    
    return {
      status: todayRecord.status,
      clockIn: todayRecord.clockIn,
      clockOut: todayRecord.clockOut,
      totalHours: todayRecord.totalHours
    }
  }
}