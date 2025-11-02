import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import { diagnosePatient, bookAppointment } from "../services/api";
import KnowledgeGraphViewer from "../components/KnowledgeGraphViewer";

const HomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("diagnosis");

  // Diagnosis form state
  const [diagnosisForm, setDiagnosisForm] = useState({
    name: "",
    age: "",
    gender: "",
    symptoms: "",
  });
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const [diagnosisResults, setDiagnosisResults] = useState(null);

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    patientName: "",
    date: "",
    time: "",
    duration: 60,
    notes: "",
    attachReport: false,
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showKnowledgeGraph, setShowKnowledgeGraph] = useState(false);

  const handleDiagnosisSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosisForm.symptoms.trim()) {
      alert("Please describe symptoms before generating a diagnosis.");
      return;
    }

    setDiagnosisLoading(true);
    try {
      const response = await diagnosePatient(diagnosisForm);
      setDiagnosisResults(response);
      // Pre-fill booking form with patient name if diagnosis successful
      setBookingForm((prev) => ({
        ...prev,
        patientName: diagnosisForm.name || prev.patientName,
        attachReport: true,
      }));
      setActiveTab("booking");
    } catch (error) {
      console.error("Diagnosis error:", error);
      alert("Failed to generate diagnosis. Please try again.");
    } finally {
      setDiagnosisLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingForm.patientName || !bookingForm.date || !bookingForm.time) {
      alert("Please fill in all required fields.");
      return;
    }

    setBookingLoading(true);
    try {
      const appointmentData = {
        patientName: bookingForm.patientName,
        date: bookingForm.date,
        time: bookingForm.time,
        duration: bookingForm.duration,
        notes: bookingForm.notes,
        attachReport: bookingForm.attachReport && diagnosisResults,
        diagnosisReport:
          bookingForm.attachReport && diagnosisResults
            ? {
                ...diagnosisResults,
                name: diagnosisForm.name,
                age: diagnosisForm.age,
                gender: diagnosisForm.gender,
                symptoms: diagnosisForm.symptoms,
              }
            : null,
      };

      const result = await bookAppointment(appointmentData);
      alert(
        `✅ Appointment booked successfully!${
          result.calendarLink
            ? "\n\nClick here to view in Google Calendar: " +
              result.calendarLink
            : ""
        }`
      );

      // Reset forms
      setDiagnosisForm({ name: "", age: "", gender: "", symptoms: "" });
      setDiagnosisResults(null);
      setBookingForm({
        patientName: "",
        date: "",
        time: "",
        duration: 60,
        notes: "",
        attachReport: false,
      });

      navigate("/appointments");
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to book appointment. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  // Set default date to today
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="home-page">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="#3b82f6" />
              <path
                d="M20 10L20 30M12 20L28 20"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <span className="logo-text">DocAssist</span>
          </div>
          <nav className="nav-menu">
            <button
              className={`nav-tab ${activeTab === "diagnosis" ? "active" : ""}`}
              onClick={() => setActiveTab("diagnosis")}
            >
              🧠 Medical Diagnosis
            </button>
            <button
              className={`nav-tab ${activeTab === "booking" ? "active" : ""}`}
              onClick={() => setActiveTab("booking")}
            >
              📅 Book Appointment
            </button>
            <button
              className="nav-tab"
              onClick={() => navigate("/appointments")}
            >
              📋 View Appointments
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <div className="content-container">
          {/* Diagnosis Tab */}
          {activeTab === "diagnosis" && (
            <div className="tab-content">
              <div className="page-title-header">
                <h1 className="page-title">
                  Medical Diagnosis with Knowledge Graph
                </h1>
                {diagnosisResults?.knowledge_graph && (
                  <button
                    className="view-graph-btn-large"
                    onClick={() => setShowKnowledgeGraph(true)}
                    title="View Knowledge Graph Visualization"
                  >
                    📊 View Knowledge Graph
                  </button>
                )}
              </div>

              <form onSubmit={handleDiagnosisSubmit} className="diagnosis-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Patient Name *</label>
                    <input
                      type="text"
                      value={diagnosisForm.name}
                      onChange={(e) =>
                        setDiagnosisForm({
                          ...diagnosisForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter patient name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Age *</label>
                    <input
                      type="number"
                      value={diagnosisForm.age}
                      onChange={(e) =>
                        setDiagnosisForm({
                          ...diagnosisForm,
                          age: e.target.value,
                        })
                      }
                      placeholder="Age"
                      min="0"
                      max="120"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Gender *</label>
                    <select
                      value={diagnosisForm.gender}
                      onChange={(e) =>
                        setDiagnosisForm({
                          ...diagnosisForm,
                          gender: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Describe the patient's symptoms *</label>
                  <textarea
                    value={diagnosisForm.symptoms}
                    onChange={(e) =>
                      setDiagnosisForm({
                        ...diagnosisForm,
                        symptoms: e.target.value,
                      })
                    }
                    placeholder="Enter symptoms..."
                    rows="6"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={diagnosisLoading}
                >
                  {diagnosisLoading
                    ? "Generating Diagnosis..."
                    : "🧠 Generate Diagnosis & Graph"}
                </button>
              </form>

              {diagnosisResults && (
                <div className="diagnosis-results">
                  <div className="success-banner">
                    ✅ Diagnosis complete! You can now book an appointment.
                  </div>

                  <div className="results-sections">
                    <div className="result-section">
                      <h3>📋 Clinical Report</h3>
                      <div className="report-content">
                        {diagnosisResults.report ||
                          "No detailed report available."}
                      </div>
                    </div>

                    {diagnosisResults.diagnosis && (
                      <div className="result-section">
                        <h3>🩺 Diagnosis</h3>
                        <div className="report-content">
                          {diagnosisResults.diagnosis}
                        </div>
                      </div>
                    )}

                    {diagnosisResults.treatment && (
                      <div className="result-section">
                        <h3>💊 Treatment Plan</h3>
                        <div className="report-content">
                          {diagnosisResults.treatment}
                        </div>
                      </div>
                    )}

                    {diagnosisResults.knowledge_graph && (
                      <div className="result-section">
                        <div className="graph-section-header">
                          <h3>🧠 Knowledge Graph</h3>
                          <button
                            className="view-graph-btn"
                            onClick={() => setShowKnowledgeGraph(true)}
                          >
                            📊 View Graph
                          </button>
                        </div>
                        <div className="graph-placeholder">
                          <p>Knowledge graph data available</p>
                          <small>
                            Click "View Graph" to see the visualization
                          </small>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Knowledge Graph Modal */}
              {diagnosisResults?.knowledge_graph && (
                <KnowledgeGraphViewer
                  kgData={diagnosisResults.knowledge_graph}
                  isOpen={showKnowledgeGraph}
                  onClose={() => setShowKnowledgeGraph(false)}
                />
              )}
            </div>
          )}

          {/* Booking Tab */}
          {activeTab === "booking" && (
            <div className="tab-content">
              <h1 className="page-title">
                Book an Appointment with Medical Report
              </h1>

              {diagnosisResults && (
                <div className="info-banner">
                  📄 Medical report ready for{" "}
                  <strong>{diagnosisForm.name}</strong> – will be auto-attached
                  to Google Calendar event.
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="booking-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Patient Name *</label>
                    <input
                      type="text"
                      value={bookingForm.patientName}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          patientName: e.target.value,
                        })
                      }
                      placeholder="Enter patient name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) =>
                        setBookingForm({ ...bookingForm, date: e.target.value })
                      }
                      min={getTodayDate()}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Time *</label>
                    <input
                      type="time"
                      value={bookingForm.time}
                      onChange={(e) =>
                        setBookingForm({ ...bookingForm, time: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Duration (minutes) *</label>
                    <select
                      value={bookingForm.duration}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          duration: parseInt(e.target.value),
                        })
                      }
                      required
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes / Reason for visit</label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, notes: e.target.value })
                    }
                    placeholder="Enter notes..."
                    rows="4"
                  />
                </div>

                {diagnosisResults && (
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={bookingForm.attachReport}
                        onChange={(e) =>
                          setBookingForm({
                            ...bookingForm,
                            attachReport: e.target.checked,
                          })
                        }
                      />
                      Attach medical report to appointment
                    </label>
                    <small>
                      The medical report will be created as a Google Doc and
                      linked in the Calendar event description.
                    </small>
                  </div>
                )}

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? "Booking..." : "📅 Book Appointment"}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>
            ⚠️ <strong>Disclaimer:</strong> AI Assistant for Educational Use
            Only
          </p>
          <p>
            Not a substitute for medical advice. Always consult licensed
            professionals.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
