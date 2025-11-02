import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./DoctorProfile.css";

const DoctorProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    // Replace with API call
    setDoctor({
      id: id,
      name: "Dr. John Smith",
      specialty: "Cardiologist",
      rating: 5,
      location: "New York, USA",
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    });
  }, [id]);

  if (!doctor) {
    return <div>Loading...</div>;
  }

  return (
    <div className="doctor-profile-screen">
      <div className="mobile-header blue-header">
        <button className="back-button" onClick={() => navigate("/doctors")}>
          ←
        </button>
        <span className="time">12:12</span>
        <div className="status-icons">
          <span>📶</span>
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      <div className="doctor-profile-banner">
        <div className="doctor-profile-image">
          <svg width="200" height="250" viewBox="0 0 200 250" fill="none">
            <circle cx="100" cy="100" r="60" fill="#E5E7EB" />
            <rect
              x="60"
              y="160"
              width="80"
              height="90"
              rx="10"
              fill="#FFFFFF"
            />
            <circle cx="100" cy="90" r="5" fill="#3B82F6" />
            <rect x="95" y="95" width="10" height="40" fill="#3B82F6" />
          </svg>
        </div>
      </div>

      <div className="doctor-profile-card">
        <div className="doctor-profile-header">
          <h2 className="doctor-profile-name">{doctor.name}</h2>
          <p className="doctor-profile-specialty">{doctor.specialty}</p>
          <div className="doctor-profile-rating">
            {[...Array(doctor.rating)].map((_, i) => (
              <span key={i} className="star">
                ⭐
              </span>
            ))}
          </div>
          <p className="doctor-profile-location">{doctor.location}</p>
        </div>

        <div className="doctor-profile-bio">
          <h3 className="bio-title">About</h3>
          <p className="bio-text">{doctor.bio}</p>
        </div>

        <button
          className="appointment-button"
          onClick={() => navigate(`/appointment/${doctor.id}`)}
        >
          Appointment
        </button>
      </div>
    </div>
  );
};

export default DoctorProfile;
