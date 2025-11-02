import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ViewAppointments.css";
import { getAppointments, deleteAppointment } from "../services/api";

const ViewAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await getAppointments();
      setAppointments(data || []);
    } catch (error) {
      console.error("Error loading appointments:", error);
      // Mock data for demo
      setAppointments([
        {
          id: 1,
          summary: "Medical Appointment - John Doe",
          start: "2024-01-15T10:00:00",
          description: "Regular checkup",
          docUrl: "https://docs.google.com/document/d/example",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateObj) => {
    if (!dateObj) return "Invalid Date";

    // Handle both string and object formats from Google Calendar API
    let date;
    if (typeof dateObj === "string") {
      date = new Date(dateObj);
    } else if (dateObj.dateTime) {
      date = new Date(dateObj.dateTime);
    } else if (dateObj.date) {
      date = new Date(dateObj.date);
    } else {
      return "Invalid Date";
    }

    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) {
      return;
    }

    try {
      await deleteAppointment(appointmentId);
      loadAppointments(); // Reload the list
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("Failed to delete appointment");
    }
  };

  const extractDocUrl = (description) => {
    if (!description) return null;
    const match = description.match(
      /https:\/\/docs\.google\.com\/document\/d\/[^\s\)]+/
    );
    return match ? match[0] : null;
  };

  return (
    <div className="view-appointments-page">
      <div className="appointments-header">
        <button className="back-button" onClick={() => navigate("/")}>
          ← Back to Home
        </button>
        <h1>Upcoming Appointments</h1>
        <button
          className="refresh-button"
          onClick={loadAppointments}
          disabled={loading}
        >
          {loading ? "Loading..." : "🔄 Refresh"}
        </button>
      </div>

      <div className="appointments-content">
        {loading ? (
          <div className="loading-state">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <p>No appointments found.</p>
            <button className="book-button" onClick={() => navigate("/app")}>
              Book an Appointment
            </button>
          </div>
        ) : (
          <div className="appointments-list">
            {appointments.map((appointment, index) => {
              const docUrl =
                extractDocUrl(appointment.description) || appointment.docUrl;
              return (
                <div key={appointment.id || index} className="appointment-card">
                  <div className="appointment-header">
                    <span className="appointment-number">📅 {index + 1}</span>
                    <h3 className="appointment-title">
                      {appointment.summary || "Untitled Appointment"}
                    </h3>
                    {appointment.id && (
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(appointment.id)}
                        title="Delete appointment"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <div className="appointment-details">
                    <div className="appointment-time">
                      🕒 {formatDate(appointment.start)}
                    </div>
                    {appointment.description && (
                      <div className="appointment-description">
                        {appointment.description.split("\n").map((line, i) => {
                          if (
                            line.includes("Patient:") ||
                            line.includes("Notes:")
                          ) {
                            return <div key={i}>{line}</div>;
                          }
                          if (line.includes("Medical Report:")) {
                            return (
                              <div key={i} className="report-section">
                                📄 Medical Report:{" "}
                                {docUrl ? (
                                  <a
                                    href={docUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="report-link"
                                  >
                                    {docUrl}
                                  </a>
                                ) : (
                                  <span>
                                    {line
                                      .replace("📋 Medical Report:", "")
                                      .trim()}
                                  </span>
                                )}
                                <br />
                                <small>
                                  (Click to view detailed report in Google
                                  Calendar)
                                </small>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAppointments;
