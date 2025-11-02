import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AppointmentBooking.css";

const AppointmentBooking = () => {
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    // Replace with API call
    setDoctor({
      id: doctorId,
      name: "Dr. John Smith",
      specialty: "Cardiologist",
      rating: 5,
      location: "New York, USA",
    });
  }, [doctorId]);

  // Generate dates for the next 7 days
  const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = getDates();
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const timeSlots = [
    { id: 1, time: "9 - 12 AM", hospital: "Hospital name, Hospital" },
    { id: 2, time: "3 - 5 PM", hospital: "Hospital name, Hospital" },
    { id: 3, time: "6 - 8 PM", hospital: "Hospital name, Hospital" },
  ];

  const handleBooking = () => {
    if (selectedDate && selectedTime) {
      // Replace with API call
      console.log("Booking appointment:", {
        doctorId,
        date: selectedDate,
        time: selectedTime,
      });
      // Navigate to confirmation or appointments list
      navigate("/appointments");
    }
  };

  if (!doctor) {
    return <div>Loading...</div>;
  }

  return (
    <div className="appointment-booking-screen">
      <div className="mobile-header blue-header">
        <button
          className="back-button"
          onClick={() => navigate(`/doctor/${doctorId}`)}
        >
          ←
        </button>
        <span className="time">12:12</span>
        <div className="status-icons">
          <span>📶</span>
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      <div className="appointment-mini-profile">
        <div className="mini-profile-content">
          <div className="mini-avatar">
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
              <circle cx="25" cy="25" r="25" fill="#E5E7EB" />
              <circle cx="25" cy="20" r="8" fill="#9CA3AF" />
              <path
                d="M12 38C12 32 17 27 25 27C33 27 38 32 38 38"
                fill="#9CA3AF"
              />
            </svg>
          </div>
          <div className="mini-info">
            <h3 className="mini-name">{doctor.name}</h3>
            <p className="mini-specialty">{doctor.specialty}</p>
            <div className="mini-rating">
              {[...Array(doctor.rating)].map((_, i) => (
                <span key={i} className="star">
                  ⭐
                </span>
              ))}
            </div>
            <p className="mini-location">{doctor.location}</p>
          </div>
        </div>
      </div>

      <div className="appointment-content">
        <div className="date-picker-section">
          <h3 className="section-title">Choose Date</h3>
          <div className="date-scroll">
            <button className="date-nav">←</button>
            <div className="dates-list">
              {dates.map((date, index) => {
                const dayName = weekDays[date.getDay()];
                const dayNumber = date.getDate();
                const isSelected =
                  selectedDate === date.toISOString().split("T")[0];

                return (
                  <div
                    key={index}
                    className={`date-item ${isSelected ? "selected" : ""}`}
                    onClick={() =>
                      setSelectedDate(date.toISOString().split("T")[0])
                    }
                  >
                    <span className="date-day">{dayName}</span>
                    <span className="date-number">{dayNumber}</span>
                  </div>
                );
              })}
            </div>
            <button className="date-nav">→</button>
          </div>
        </div>

        <div className="time-slots-section">
          <h3 className="section-title">Available Time Slots</h3>
          <div className="time-slots-list">
            {timeSlots.map((slot) => (
              <div
                key={slot.id}
                className={`time-slot-card ${
                  selectedTime === slot.id ? "selected" : ""
                }`}
                onClick={() => setSelectedTime(slot.id)}
              >
                <div className="time-slot-time">{slot.time}</div>
                <div className="time-slot-hospital">{slot.hospital}</div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="book-now-button"
          onClick={handleBooking}
          disabled={!selectedDate || !selectedTime}
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default AppointmentBooking;
