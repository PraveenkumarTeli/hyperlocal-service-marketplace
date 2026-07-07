import { useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [pendingServices, setPendingServices] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchPendingServices();
  }, []);

  const fetchPendingServices = async () => {
    try {
      const res = await API.get("/services/pending");
      setPendingServices(res.data);
    } catch (err) { console.log(err); }
  };

  const handleApprove = async (serviceId) => {
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await API.put(`/services/${serviceId}/approve`);
      setSuccessMsg("Service approved successfully!");
      fetchPendingServices();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to approve service");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="navbar">
        <h2>Admin Dashboard</h2>
        <div>
          <span className="navbar-user">Welcome, {user?.name}</span>
          <button onClick={logout} className="btn btn-logout">Logout</button>
        </div>
      </div>

      <div className="container">
        {successMsg && <p className="alert alert-success">{successMsg}</p>}
        {errorMsg && <p className="alert alert-error">{errorMsg}</p>}

        <h3 className="section-title">Pending Service Approvals</h3>
        {pendingServices.length === 0 && <p className="empty-text">No services waiting for approval.</p>}

        {pendingServices.map((service) => (
          <div key={service._id} className="card">
            <h4>{service.title}</h4>
            <p>Category: {service.category} | Price: ₹{service.price}</p>
            <p>Description: {service.description}</p>
            <p>Provider: {service.providerId?.name} ({service.providerId?.email})</p>
            <button onClick={() => handleApprove(service._id)} className="btn btn-success btn-sm">Approve</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;