import { useState } from "react"
import Button from "@/components/atoms/Button"
import FormField from "@/components/molecules/FormField"
import { leaveService } from "@/services/api/leaveService"
import { toast } from "react-toastify"

const leaveTypes = [
  { value: "Annual Leave", label: "Annual Leave" },
  { value: "Sick Leave", label: "Sick Leave" },
  { value: "Personal Leave", label: "Personal Leave" },
  { value: "Maternity Leave", label: "Maternity Leave" }
]

const LeaveRequestForm = ({ onSuccess, onCancel, employeeId = "1" }) => {
  const [formData, setFormData] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: ""
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.type) newErrors.type = "Leave type is required"
    if (!formData.startDate) newErrors.startDate = "Start date is required"
    if (!formData.endDate) newErrors.endDate = "End date is required"
    if (!formData.reason.trim()) newErrors.reason = "Reason is required"
    
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = "End date must be after start date"
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      await leaveService.create({
        ...formData,
        employeeId,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      })
      
      toast.success("Leave request submitted successfully!")
      onSuccess?.()
    } catch (error) {
      toast.error(error.message || "Failed to submit leave request")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormField
        label="Leave Type"
        error={errors.type}
        required
      >
        <select
          value={formData.type}
          onChange={(e) => handleChange("type", e.target.value)}
          className="input"
        >
          <option value="">Select leave type</option>
          {leaveTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Start Date"
          type="date"
          value={formData.startDate}
          onChange={(e) => handleChange("startDate", e.target.value)}
          error={errors.startDate}
          required
        />
        
        <FormField
          label="End Date"
          type="date"
          value={formData.endDate}
          onChange={(e) => handleChange("endDate", e.target.value)}
          error={errors.endDate}
          required
        />
      </div>

      <FormField
        label="Reason"
        error={errors.reason}
        required
      >
        <textarea
          value={formData.reason}
          onChange={(e) => handleChange("reason", e.target.value)}
          className="input min-h-[100px] resize-none"
          placeholder="Please provide a reason for your leave request..."
        />
      </FormField>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

export default LeaveRequestForm