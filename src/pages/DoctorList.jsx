import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DoctorList.css";

const DoctorList = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock doctor data - replace with API call
  const doctors = [
    {
      id: 1,
      name: "Dr. John Smith",
      specialty: "Cardiologist",
      rating: 5,
      location: "New York, USA",
      image: null,
    },
    {
      id: 2,
      name: "Dr. Sarah Johnson",
      specialty: "Dentist",
      rating: 5,
      location: "Los Angeles, USA",
      image: null,
    },
    {
      id: 3,
      name: "Dr. Michael Chen",
      specialty: "Neurologist",
      rating: 5,
      location: "Chicago, USA",
      image: null,
    },
  ];

  const categories = [
    { id: "cardiologist", name: "Cardiologist", icon: "❤️" },
    { id: "dentist", name: "Dentist", icon: "🦷" },
    { id: "ophthalmologist", name: "Ophthalmologist", icon: "👁️" },
    { id: "neurologist", name: "Neurologist", icon: "🧠" },
  ];

  return (
    <div className="doctor-list-screen">
      <div className="mobile-header blue-header">
        <span className="time">12:12</span>
        <div className="status-icons">
          <span>📶</span>
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      <div className="doctor-list-content">
        <div className="search-bar">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="#9CA3AF" strokeWidth="2" />
            <path
              d="M14 14L18 18"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input type="text" placeholder="Search here" />
        </div>

        <div className="categories-section">
          <h3 className="section-label">Categories</h3>
          <div className="categories-scroll">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`category-item ${
                  selectedCategory === category.id ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="category-icon">{category.icon}</div>
                <span className="category-name">{category.name}</span>
              </div>
            ))}
            <div className="category-item">
              <div className="category-icon">→</div>
            </div>
          </div>
        </div>

        <div className="doctors-list">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="doctor-card"
              onClick={() => navigate(`/doctor/${doctor.id}`)}
            >
              <div className="doctor-avatar">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                  <circle cx="30" cy="30" r="30" fill="#E5E7EB" />
                  <circle cx="30" cy="22" r="10" fill="#9CA3AF" />
                  <path
                    d="M15 45C15 38 21 32 30 32C39 32 45 38 45 45"
                    fill="#9CA3AF"
                  />
                </svg>
              </div>
              <div className="doctor-info">
                <h3 className="doctor-name">{doctor.name}</h3>
                <p className="doctor-specialty">{doctor.specialty}</p>
                <div className="doctor-rating">
                  {[...Array(doctor.rating)].map((_, i) => (
                    <span key={i} className="star">
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="doctor-location">{doctor.location}</p>
              </div>
              <div className="doctor-arrow">→</div>
            </div>
          ))}
        </div>

        <div className="scroll-indicator">
          <span>↓</span>
        </div>
      </div>
    </div>
  );
};

export default DoctorList;
