import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import { getAppointments } from "../services/api";

const LandingPage = () => {
  const navigate = useNavigate();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    // Load upcoming appointments for the cards section
    const loadAppointments = async () => {
      try {
        const data = await getAppointments();
        setUpcomingAppointments((data || []).slice(0, 3)); // Show only first 3
      } catch (error) {
        console.error("Error loading appointments:", error);
      }
    };
    loadAppointments();
  }, []);

  const formatDate = (dateObj) => {
    if (!dateObj) return "Invalid Date";
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
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const extractDocUrl = (description) => {
    if (!description) return null;
    const match = description.match(
      /https:\/\/docs\.google\.com\/document\/d\/[^\s\)]+/
    );
    return match ? match[0] : null;
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="#3B82F6" />
              <path
                d="M20 10L20 30M12 20L28 20"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <span className="logo-text">DiagnoBridge</span>
          </div>
          <nav className="nav-links">
            <a href="#home">Home</a>
            <a href="#features">About</a>
            <a href="#features">Services</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-background">
          <div className="bg-blob blob-1"></div>
          <div className="bg-blob blob-2"></div>
          <div className="bg-blob blob-3"></div>
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Right <span className="underline-red">Diagnosis</span> And The Right
              Appointment
            </h1>
            <p className="hero-description">
            AI-powered diagnosis and seamless doctor booking , connected by knowledge
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => navigate("/app")}>
                Make Appointment
              </button>
              <button
                className="btn-secondary"
                onClick={() => navigate("/app")}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle
                    cx="10"
                    cy="10"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path d="M8 6L14 10L8 14V6Z" fill="currentColor" />
                </svg>
                Get Diagnosis
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="doctor-image-wrapper">
              <div className="doctor-placeholder">
                <svg width="300" height="400" viewBox="0 0 300 400" fill="none">
                  <circle cx="150" cy="120" r="80" fill="#E5E7EB" />
                  <rect
                    x="80"
                    y="200"
                    width="140"
                    height="180"
                    rx="15"
                    fill="#FFFFFF"
                  />
                  <circle cx="150" cy="110" r="8" fill="#3B82F6" />
                  <rect x="140" y="118" width="20" height="60" fill="#3B82F6" />
                </svg>
              </div>
              <div className="floating-icons">
                <div className="floating-icon heart-icon">❤️</div>
                <div className="floating-icon chat-icon">💬</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Replaces "How it Works" */}
      <section className="features-section" id="features">
        <div className="section-content">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">Comprehensive Healthcare Solutions</p>

          <div className="features-grid">
            <div className="feature-card" onClick={() => navigate("/app")}>
              <div className="feature-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#3B82F6"
                    strokeWidth="3"
                  />
                  <path
                    d="M32 16L32 48M20 32L44 32"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="32" cy="32" r="8" fill="#3B82F6" />
                </svg>
              </div>
              <h3 className="feature-title">Medical Diagnosis</h3>
              <p className="feature-description">
                AI-powered symptom analysis and comprehensive medical diagnosis
              </p>
            </div>

            <div className="feature-card" onClick={() => navigate("/app")}>
              <div className="feature-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <rect
                    x="8"
                    y="8"
                    width="48"
                    height="48"
                    rx="8"
                    stroke="#3B82F6"
                    strokeWidth="3"
                  />
                  <circle cx="20" cy="20" r="4" fill="#3B82F6" />
                  <circle cx="44" cy="20" r="4" fill="#3B82F6" />
                  <circle cx="32" cy="44" r="4" fill="#3B82F6" />
                  <path
                    d="M20 20L32 44L44 20"
                    stroke="#3B82F6"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3 className="feature-title">Visualize Knowledge Graph</h3>
              <p className="feature-description">
                Interactive visualization of medical relationships and
                connections
              </p>
            </div>

            <div className="feature-card" onClick={() => navigate("/app")}>
              <div className="feature-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <rect
                    x="12"
                    y="12"
                    width="40"
                    height="40"
                    rx="6"
                    stroke="#3B82F6"
                    strokeWidth="3"
                  />
                  <path
                    d="M20 20L20 28M28 20L28 28M36 20L36 28"
                    stroke="#3B82F6"
                    strokeWidth="2"
                  />
                  <circle cx="32" cy="40" r="4" fill="#3B82F6" />
                </svg>
              </div>
              <h3 className="feature-title">Booking</h3>
              <p className="feature-description">
                Easy appointment scheduling with Google Calendar integration
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Appointments Cards */}
      <section className="appointments-section">
        <div className="section-content">
          <h2 className="section-title">Upcoming Appointments</h2>
          <p className="section-subtitle">
            Your scheduled medical appointments
          </p>

          {upcomingAppointments.length > 0 ? (
            <div className="appointments-cards-grid">
              {upcomingAppointments.map((appointment, index) => {
                const docUrl = extractDocUrl(appointment.description);
                return (
                  <div
                    key={appointment.id || index}
                    className="appointment-card-mini"
                  >
                    <div className="appointment-card-header">
                      <span className="appointment-icon">📅</span>
                      <span className="appointment-number">{index + 1}</span>
                    </div>
                    <h3 className="appointment-card-title">
                      {appointment.summary || "Untitled Appointment"}
                    </h3>
                    <div className="appointment-card-time">
                      🕒 {formatDate(appointment.start)}
                    </div>
                    {appointment.description && (
                      <div className="appointment-card-details">
                        {appointment.description.split("\n").map((line, i) => {
                          if (
                            line.includes("Patient:") ||
                            line.includes("Notes:")
                          ) {
                            return <div key={i}>{line}</div>;
                          }
                          if (docUrl && line.includes("Medical Report:")) {
                            return (
                              <div key={i} className="appointment-report-link">
                                📄 Medical Report:{" "}
                                <a
                                  href={docUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="report-link-inline"
                                >
                                  {docUrl.length > 40
                                    ? docUrl.substring(0, 40) + "..."
                                    : docUrl}
                                </a>
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
                );
              })}
            </div>
          ) : (
            <div className="no-appointments">
              <p>
                No upcoming appointments.{" "}
                <a
                  href="/app"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/app");
                  }}
                >
                  Book one now
                </a>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" id="contact">
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

export default LandingPage;
