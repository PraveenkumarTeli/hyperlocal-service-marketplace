import { useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

function CustomerDashboard() {
  const { user, logout } = useAuth();
  const [services, setServices] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [message, setMessage] = useState("");

  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");

  useEffect(() => {
    fetchServices();
    fetchMyBookings();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await API.get("/services");
      setServices(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await API.get("/bookings/my-bookings");
      setMyBookings(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleBook = async (serviceId) => {
    setMessage("");
    try {
      await API.post("/bookings", {
        serviceId,
        bookingDate,
        timeSlot,
      });
      setMessage("Booking created successfully!");
      setSelectedServiceId(null);
      setBookingDate("");
      setTimeSlot("");
      fetchMyBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || "Booking failed");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Customer Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </div>
      <p>Welcome, {user?.name}!</p>

      {message && <p style={{ color: "green" }}>{message}</p>}

      <h3>Available Services</h3>
      {services.length === 0 && <p>No services available yet.</p>}

      {services.map((service) => (
        <div key={service._id} style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "10px" }}>
          <h4>{service.title}</h4>
          <p>Category: {service.category}</p>
          <p>Price: ₹{service.price}</p>
          <p>Provider: {service.providerId?.name} ({service.providerId?.location})</p>

          {selectedServiceId === service._id ? (
            <div>
              <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} style={{ marginRight: "10px" }} />
              <input type="text" placeholder="e.g. 10:00-11:00" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} style={{ marginRight: "10px" }} />
              <button onClick={() => handleBook(service._id)}>Confirm Booking</button>
              <button onClick={() => setSelectedServiceId(null)}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setSelectedServiceId(service._id)}>Book Now</button>
          )}
        </div>
      ))}

      <h3>My Bookings</h3>
      {myBookings.length === 0 && <p>You have no bookings yet.</p>}

      {myBookings.map((booking) => (
        <div key={booking._id} style={{ border: "1px solid #eee", padding: "10px", marginBottom: "10px" }}>
          <p><strong>{booking.serviceId?.title}</strong> with {booking.providerId?.name}</p>
          <p>{booking.bookingDate} | {booking.timeSlot}</p>
          <p>Status: {booking.status}</p>
        </div>
      ))}
    </div>
  );
}

export default CustomerDashboard;