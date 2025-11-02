import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Medical Diagnosis API
export const diagnosePatient = async (patientData) => {
  try {
    const response = await api.post("/api/diagnose", patientData);
    return response.data;
  } catch (error) {
    console.error("Diagnosis API error:", error);
    throw error;
  }
};

// Appointment API
export const bookAppointment = async (appointmentData) => {
  try {
    const response = await api.post("/api/appointments", appointmentData);
    return response.data;
  } catch (error) {
    console.error("Booking API error:", error);
    throw error;
  }
};

// Get Appointments
export const getAppointments = async () => {
  try {
    const response = await api.get("/api/appointments");
    return response.data;
  } catch (error) {
    console.error("Get appointments API error:", error);
    throw error;
  }
};

// Get Doctors List
export const getDoctors = async (specialty = null) => {
  try {
    const params = specialty ? { specialty } : {};
    const response = await api.get("/api/doctors", { params });
    return response.data;
  } catch (error) {
    console.error("Get doctors API error:", error);
    throw error;
  }
};

// Get Doctor Details
export const getDoctor = async (doctorId) => {
  try {
    const response = await api.get(`/api/doctors/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error("Get doctor API error:", error);
    throw error;
  }
};

// Delete Appointment
export const deleteAppointment = async (appointmentId) => {
  try {
    const response = await api.delete(`/api/appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error("Delete appointment API error:", error);
    throw error;
  }
};

export default api;
