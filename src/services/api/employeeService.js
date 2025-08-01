import { toast } from "react-toastify"

export const employeeService = {
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
          { field: { Name: "firstName_c" } },
          { field: { Name: "lastName_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "department_c" } },
          { field: { Name: "role_c" } },
          { field: { Name: "joinDate_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "avatar_c" } },
          { field: { Name: "address_c" } },
          { field: { Name: "emergencyContact_c" } },
          { field: { Name: "salary_c" } },
          { field: { Name: "employeeId_c" } },
          { field: { Name: "managerId_c" } }
        ]
      }

      const response = await apperClient.fetchRecords('employee_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data || []
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching employees:", error?.response?.data?.message)
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
          { field: { Name: "firstName_c" } },
          { field: { Name: "lastName_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "department_c" } },
          { field: { Name: "role_c" } },
          { field: { Name: "joinDate_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "avatar_c" } },
          { field: { Name: "address_c" } },
          { field: { Name: "emergencyContact_c" } },
          { field: { Name: "salary_c" } },
          { field: { Name: "employeeId_c" } },
          { field: { Name: "managerId_c" } }
        ]
      }

      const response = await apperClient.getRecordById('employee_c', id, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      return response.data
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching employee with ID ${id}:`, error?.response?.data?.message)
      } else {
        console.error(error.message)
      }
      return null
    }
  },

  async create(employeeData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        records: [{
          Name: `${employeeData.firstName_c} ${employeeData.lastName_c}`,
          firstName_c: employeeData.firstName_c,
          lastName_c: employeeData.lastName_c,
          email_c: employeeData.email_c,
          phone_c: employeeData.phone_c,
          department_c: employeeData.department_c,
          role_c: employeeData.role_c,
          joinDate_c: new Date().toISOString(),
          status_c: "Active",
          avatar_c: employeeData.avatar_c,
          address_c: employeeData.address_c,
          emergencyContact_c: employeeData.emergencyContact_c,
          salary_c: employeeData.salary_c,
          employeeId_c: employeeData.employeeId_c,
          managerId_c: employeeData.managerId_c ? parseInt(employeeData.managerId_c) : null
        }]
      }

      const response = await apperClient.createRecord('employee_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create employee ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          
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
        console.error("Error creating employee:", error?.response?.data?.message)
      } else {
        console.error(error.message)
      }
      return null
    }
  },

  async update(id, employeeData) {
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
      if (employeeData.firstName_c !== undefined) {
        updateFields.firstName_c = employeeData.firstName_c
      }
      if (employeeData.lastName_c !== undefined) {
        updateFields.lastName_c = employeeData.lastName_c
      }
      if (employeeData.firstName_c !== undefined || employeeData.lastName_c !== undefined) {
        updateFields.Name = `${employeeData.firstName_c || ''} ${employeeData.lastName_c || ''}`.trim()
      }
      if (employeeData.email_c !== undefined) updateFields.email_c = employeeData.email_c
      if (employeeData.phone_c !== undefined) updateFields.phone_c = employeeData.phone_c
      if (employeeData.department_c !== undefined) updateFields.department_c = employeeData.department_c
      if (employeeData.role_c !== undefined) updateFields.role_c = employeeData.role_c
      if (employeeData.joinDate_c !== undefined) updateFields.joinDate_c = employeeData.joinDate_c
      if (employeeData.status_c !== undefined) updateFields.status_c = employeeData.status_c
      if (employeeData.avatar_c !== undefined) updateFields.avatar_c = employeeData.avatar_c
      if (employeeData.address_c !== undefined) updateFields.address_c = employeeData.address_c
      if (employeeData.emergencyContact_c !== undefined) updateFields.emergencyContact_c = employeeData.emergencyContact_c
      if (employeeData.salary_c !== undefined) updateFields.salary_c = employeeData.salary_c
      if (employeeData.employeeId_c !== undefined) updateFields.employeeId_c = employeeData.employeeId_c
      if (employeeData.managerId_c !== undefined) {
        updateFields.managerId_c = employeeData.managerId_c ? parseInt(employeeData.managerId_c) : null
      }

      const params = {
        records: [updateFields]
      }

      const response = await apperClient.updateRecord('employee_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        const failedUpdates = response.results.filter(result => !result.success)
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update employee ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`)
          
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
        console.error("Error updating employee:", error?.response?.data?.message)
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

      const response = await apperClient.deleteRecord('employee_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        const failedDeletions = response.results.filter(result => !result.success)
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete employee ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`)
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        return successfulDeletions.length > 0
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting employee:", error?.response?.data?.message)
      } else {
        console.error(error.message)
      }
      return false
    }
  },

  async search(query, filters = {}) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const whereConditions = []

      if (query) {
        whereConditions.push({
          operator: "OR",
          subGroups: [
            {
              conditions: [
                {
                  fieldName: "firstName_c",
                  operator: "Contains",
                  values: [query]
                }
              ],
              operator: "OR"
            },
            {
              conditions: [
                {
                  fieldName: "lastName_c",
                  operator: "Contains",
                  values: [query]
                }
              ],
              operator: "OR"
            },
            {
              conditions: [
                {
                  fieldName: "email_c",
                  operator: "Contains",
                  values: [query]
                }
              ],
              operator: "OR"
            },
            {
              conditions: [
                {
                  fieldName: "employeeId_c",
                  operator: "Contains",
                  values: [query]
                }
              ],
              operator: "OR"
            }
          ]
        })
      }

      const where = []
      if (filters.department && filters.department !== "all") {
        where.push({
          FieldName: "department_c",
          Operator: "EqualTo",
          Values: [filters.department]
        })
      }

      if (filters.status && filters.status !== "all") {
        where.push({
          FieldName: "status_c",
          Operator: "EqualTo",
          Values: [filters.status]
        })
      }

      if (filters.role && filters.role !== "all") {
        where.push({
          FieldName: "role_c",
          Operator: "EqualTo",
          Values: [filters.role]
        })
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "firstName_c" } },
          { field: { Name: "lastName_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "department_c" } },
          { field: { Name: "role_c" } },
          { field: { Name: "joinDate_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "avatar_c" } },
          { field: { Name: "address_c" } },
          { field: { Name: "emergencyContact_c" } },
          { field: { Name: "salary_c" } },
          { field: { Name: "employeeId_c" } },
          { field: { Name: "managerId_c" } }
        ],
        where: where,
        whereGroups: whereConditions
      }

      const response = await apperClient.fetchRecords('employee_c', params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      return response.data || []
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error searching employees:", error?.response?.data?.message)
      } else {
        console.error(error.message)
      }
      return []
    }
  },

  async getDepartments() {
    try {
      const employees = await this.getAll()
      const departments = [...new Set(employees.map(emp => emp.department_c).filter(Boolean))]
      return departments.sort()
    } catch (error) {
      console.error("Error getting departments:", error.message)
      return []
    }
  },

  async getRoles() {
    try {
      const employees = await this.getAll()
      const roles = [...new Set(employees.map(emp => emp.role_c).filter(Boolean))]
      return roles.sort()
    } catch (error) {
      console.error("Error getting roles:", error.message)
      return []
    }
  },

  async getStats() {
    try {
      const employees = await this.getAll()
      const total = employees.length
      const active = employees.filter(emp => emp.status_c === "Active").length
      const onLeave = employees.filter(emp => emp.status_c === "On Leave").length
      const inactive = employees.filter(emp => emp.status_c === "Inactive").length

      const departmentCounts = employees.reduce((acc, emp) => {
        if (emp.department_c) {
          acc[emp.department_c] = (acc[emp.department_c] || 0) + 1
        }
        return acc
      }, {})

      return {
        total,
        active,
        onLeave,
        inactive,
        departmentCounts
      }
    } catch (error) {
      console.error("Error getting employee stats:", error.message)
      return {
        total: 0,
        active: 0,
        onLeave: 0,
        inactive: 0,
        departmentCounts: {}
      }
    }
  }
}