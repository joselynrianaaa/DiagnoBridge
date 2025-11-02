import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MedicalDiagnosis.css";
import { diagnosePatient } from "../services/api";

const MedicalDiagnosis = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    symptoms: "",
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.symptoms.trim()) {
      alert("Please describe symptoms before generating a diagnosis.");
      return;
    }

    setLoading(true);
    try {
      const response = await diagnosePatient(formData);
      setResults(response);
    } catch (error) {
      console.error("Diagnosis error:", error);
      alert("Failed to generate diagnosis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medical-diagnosis-page">
      <div className="diagnosis-header">
        <button className="back-button" onClick={() => navigate("/")}>
          ← Back
        </button>
        <h1>Medical Diagnosis</h1>
      </div>

      <div className="diagnosis-content">
        <form onSubmit={handleSubmit} className="diagnosis-form">
          <div className="form-row">
            <div className="form-group">
              <label>Patient Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter patient name"
              />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                placeholder="Age"
                min="0"
                max="120"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Describe the patient's symptoms</label>
            <textarea
              value={formData.symptoms}
              onChange={(e) =>
                setFormData({ ...formData, symptoms: e.target.value })
              }
              placeholder="Enter symptoms..."
              rows="6"
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Generating Diagnosis..." : "Generate Diagnosis & Graph"}
          </button>
        </form>

        {results && (
          <div className="diagnosis-results">
            <div className="success-message">
              ✅ Diagnosis complete! You can now book an appointment.
            </div>

            <div className="results-tabs">
              <div className="result-section">
                <h3>Clinical Report</h3>
                <div className="report-content">
                  {results.report || "No detailed report available."}
                </div>
              </div>

              {results.knowledge_graph && (
                <div className="result-section">
                  <h3>Knowledge Graph</h3>
                  <div className="graph-placeholder">
                    <p>Knowledge graph visualization would appear here</p>
                    <small>
                      Connect to your backend API to render the graph
                    </small>
                  </div>
                </div>
              )}

              <div className="result-section">
                <h3>Diagnosis</h3>
                <div className="report-content">
                  {results.diagnosis || "No diagnosis generated"}
                </div>
              </div>

              <div className="result-section">
                <h3>Treatment Plan</h3>
                <div className="report-content">
                  {results.treatment || "No treatment plan generated"}
                </div>
              </div>
            </div>

            <button
              className="book-appointment-button"
              onClick={() => navigate("/doctors")}
            >
              Book Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalDiagnosis;
