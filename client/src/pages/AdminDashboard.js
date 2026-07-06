import { useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [pendingServices, setPendingServices] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPendingServices();
  }, []);

  const fetchPendingServices = async () => {
    try {
      const res = await API.get("/services/pending");
      setPendingServices(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleApprove = async (serviceId) => {
    setMessage("");
    try {
      await API.put(`/services/${serviceId}/approve`);
      setMessage("Service approved successfully!");
      fetchPendingServices();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to approve service");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Admin Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </div>
      <p>Welcome, {user?.name}!</p>

      {message && <p style={{ color: "green" }}>{message}</p>}

      <h3>Pending Service Approvals</h3>
      {pendingServices.length === 0 && <p>No services waiting for approval.</p>}

      {pendingServices.map((service) => (
        <div key={service._id} style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "10px" }}>
          <h4>{service.title}</h4>
          <p>Category: {service.category} | Price: ₹{service.price}</p>
          <p>Description: {service.description}</p>
          <p>Provider: {service.providerId?.name} ({service.providerId?.email})</p>
          <button onClick={() => handleApprove(service._id)}>Approve</button>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;