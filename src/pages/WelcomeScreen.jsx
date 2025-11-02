import React from "react";
import { useNavigate } from "react-router-dom";
import "./WelcomeScreen.css";

const WelcomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-screen">
      <div className="mobile-header">
        <span className="time">12:12</span>
        <div className="status-icons">
          <span>📶</span>
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      <div className="welcome-content">
        <div className="welcome-icon">
          <div className="doctor-illustration">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="80" r="40" fill="#E5E7EB" />
              <rect
                x="70"
                y="120"
                width="60"
                height="60"
                rx="10"
                fill="#3B82F6"
              />
              <circle cx="100" cy="70" r="5" fill="#3B82F6" />
              <rect x="95" y="75" width="10" height="30" fill="#FFFFFF" />
              <circle cx="80" cy="90" r="3" fill="#3B82F6" />
              <circle cx="120" cy="90" r="3" fill="#3B82F6" />
            </svg>
          </div>
        </div>

        <h1 className="welcome-title">
          Doctor
          <br />
          Appointment
        </h1>

        <div className="welcome-buttons">
          <button className="btn-login" onClick={() => navigate("/doctors")}>
            Log in
          </button>
          <button
            className="btn-create-account"
            onClick={() => navigate("/doctors")}
          >
            create account
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
