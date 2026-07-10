import { useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

function ProviderDashboard() {
  const { user, logout } = useAuth();
  const [myServices, setMyServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({ category: "", title: "", description: "", price: "" });

  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editData, setEditData] = useState({ category: "", title: "", description: "", price: "" });

  useEffect(() => {
    fetchMyServices();
    fetchBookings();
  }, []);

  const fetchMyServices = async () => {
    try {
      const res = await API.get("/services/my-services");
      setMyServices(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchBookings = async () => {
    try {
      const res = await API.get("/bookings/provider-bookings");
      setBookings(res.data);
    } catch (err) { console.log(err); }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await API.post("/services", formData);
      setSuccessMsg("Service created! Waiting for admin approval.");
      setFormData({ category: "", title: "", description: "", price: "" });
      fetchMyServices();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create service");
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await API.put(`/bookings/${bookingId}/status`, { status });
      fetchBookings();
    } catch (err) { console.log(err); }
  };

  const startEdit = (service) => {
    setEditingServiceId(service._id);
    setEditData({
      category: service.category,
      title: service.title,
      description: service.description || "",
      price: service.price,
    });
    setSuccessMsg("");
    setErrorMsg("");
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async (serviceId) => {
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await API.put(`/services/${serviceId}`, editData);
      setSuccessMsg("Service updated! It will need admin re-approval before going live again.");
      setEditingServiceId(null);
      fetchMyServices();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update service");
    }
  };

  const badgeClass = (status) => `badge badge-${status}`;

  return (
    <div className="page-wrapper">
      <div className="navbar">
        <h2>Provider Dashboard</h2>
        <div>
          <span className="navbar-user">Welcome, {user?.name}</span>
          <button onClick={logout} className="btn btn-logout">Logout</button>
        </div>
      </div>

      <div className="container">
        <h3 className="section-title">Create a New Service</h3>
        <form onSubmit={handleCreateService} className="card">
          <div className="form-group">
            <input type="text" name="category" placeholder="Category (e.g. Electrician)" className="form-control" value={formData.category} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <input type="text" name="title" placeholder="Service Title" className="form-control" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <textarea name="description" placeholder="Description" className="form-control" value={formData.description} onChange={handleChange} />
          </div>
          <div className="form-group">
            <input type="number" name="price" placeholder="Price" className="form-control" value={formData.price} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary">Create Service</button>
        </form>

        {successMsg && <p className="alert alert-success">{successMsg}</p>}
        {errorMsg && <p className="alert alert-error">{errorMsg}</p>}

        <h3 className="section-title">My Services</h3>
        {myServices.length === 0 && <p className="empty-text">You haven't listed any services yet.</p>}
        {myServices.map((service) => (
          <div key={service._id} className="card">
            {editingServiceId === service._id ? (
              <div>
                <div className="form-group">
                  <label>Category</label>
                  <input type="text" name="category" className="form-control" value={editData.category} onChange={handleEditChange} />
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" name="title" className="form-control" value={editData.title} onChange={handleEditChange} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" className="form-control" value={editData.description} onChange={handleEditChange} />
                </div>
                <div className="form-group">
                  <label>Price</label>
                  <input type="number" name="price" className="form-control" value={editData.price} onChange={handleEditChange} />
                </div>
                <button onClick={() => handleSaveEdit(service._id)} className="btn btn-success btn-sm">Save Changes</button>
                <button onClick={() => setEditingServiceId(null)} className="btn btn-secondary btn-sm">Cancel</button>
              </div>
            ) : (
              <div>
                <h4>{service.title}</h4>
                <p>Category: {service.category} | Price: ₹{service.price}</p>
                <p>{service.description}</p>
                <span className={service.isApproved ? "badge badge-approved" : "badge badge-notapproved"}>
                  {service.isApproved ? "Approved" : "Pending Approval"}
                </span>
                <div style={{ marginTop: "10px" }}>
                  <button onClick={() => startEdit(service)} className="btn btn-secondary btn-sm">Edit</button>
                </div>
              </div>
            )}
          </div>
        ))}

        <h3 className="section-title">Incoming Bookings</h3>
        {bookings.length === 0 && <p className="empty-text">No bookings yet.</p>}
        {bookings.map((booking) => (
          <div key={booking._id} className="card">
            <h4>{booking.serviceTitleAtBooking || booking.serviceId?.title}</h4>
            <p>
  Customer: {booking.customerId?.name} —{" "}
  <a href={`tel:${booking.customerId?.phone}`} className="phone-link">
    {booking.customerId?.phone}
  </a>
</p>
            <p>{booking.bookingDate} | {booking.timeSlot} | ₹{booking.priceAtBooking}</p>
            <p><span className={badgeClass(booking.status)}>{booking.status}</span></p>

            {booking.status === "pending" && (
              <div style={{ marginTop: "10px" }}>
                <button onClick={() => handleUpdateBookingStatus(booking._id, "accepted")} className="btn btn-success btn-sm">Accept</button>
                <button onClick={() => handleUpdateBookingStatus(booking._id, "rejected")} className="btn btn-danger btn-sm">Reject</button>
              </div>
            )}

            {booking.status === "accepted" && (
              <div style={{ marginTop: "10px" }}>
                <button onClick={() => handleUpdateBookingStatus(booking._id, "completed")} className="btn btn-primary btn-sm">Mark Completed</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProviderDashboard;