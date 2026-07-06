import { useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

function ProviderDashboard() {
  const { user, logout } = useAuth();
  const [myServices, setMyServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    price: "",
  });

  useEffect(() => {
    fetchMyServices();
    fetchBookings();
  }, []);

  const fetchMyServices = async () => {
    try {
      const res = await API.get("/services/my-services");
      setMyServices(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await API.get("/bookings/provider-bookings");
      setBookings(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await API.post("/services", formData);
      setMessage("Service created! Waiting for admin approval.");
      setFormData({ category: "", title: "", description: "", price: "" });
      fetchMyServices();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create service");
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await API.put(`/bookings/${bookingId}/status`, { status });
      fetchBookings();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Provider Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </div>
      <p>Welcome, {user?.name}!</p>

      <h3>Create a New Service</h3>
      <form onSubmit={handleCreateService} style={{ marginBottom: "30px" }}>
        <input type="text" name="category" placeholder="Category (e.g. Electrician)" value={formData.category} onChange={handleChange} required style={{ display: "block", width: "100%", padding: "8px", marginBottom: "10px" }} />
        <input type="text" name="title" placeholder="Service Title" value={formData.title} onChange={handleChange} required style={{ display: "block", width: "100%", padding: "8px", marginBottom: "10px" }} />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} style={{ display: "block", width: "100%", padding: "8px", marginBottom: "10px" }} />
        <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required style={{ display: "block", width: "100%", padding: "8px", marginBottom: "10px" }} />
        <button type="submit">Create Service</button>
      </form>
      {message && <p style={{ color: "green" }}>{message}</p>}

      <h3>My Services</h3>
      {myServices.length === 0 && <p>You haven't listed any services yet.</p>}
      {myServices.map((service) => (
        <div key={service._id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
          <h4>{service.title}</h4>
          <p>Category: {service.category} | Price: ₹{service.price}</p>
          <p>Status: {service.isApproved ? "Approved ✅" : "Pending Admin Approval ⏳"}</p>
        </div>
      ))}

      <h3>Incoming Bookings</h3>
      {bookings.length === 0 && <p>No bookings yet.</p>}
      {bookings.map((booking) => (
        <div key={booking._id} style={{ border: "1px solid #eee", padding: "10px", marginBottom: "10px" }}>
          <p><strong>{booking.serviceId?.title}</strong> - Customer: {booking.customerId?.name} ({booking.customerId?.phone})</p>
          <p>{booking.bookingDate} | {booking.timeSlot}</p>
          <p>Status: {booking.status}</p>

          {booking.status === "pending" && (
            <div>
              <button onClick={() => handleUpdateBookingStatus(booking._id, "accepted")}>Accept</button>
              <button onClick={() => handleUpdateBookingStatus(booking._id, "rejected")}>Reject</button>
            </div>
          )}

          {booking.status === "accepted" && (
            <button onClick={() => handleUpdateBookingStatus(booking._id, "completed")}>Mark Completed</button>
          )}
        </div>
      ))}
    </div>
  );
}

export default ProviderDashboard;