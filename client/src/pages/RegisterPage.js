import { useState } from "react";
import API from "../api/axios";

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "customer", phone: "", location: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await API.post("/auth/register", formData);
      setSuccess("Registration successful! You can now log in.");
      setFormData({ name: "", email: "", password: "", role: "customer", phone: "", location: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Register as</label>
          <select name="role" className="form-control" value={formData.role} onChange={handleChange}>
            <option value="customer">Customer</option>
            <option value="provider">Provider</option>
          </select>
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input type="text" name="location" className="form-control" value={formData.location} onChange={handleChange} />
        </div>
        {error && <p className="alert alert-error">{error}</p>}
        {success && <p className="alert alert-success">{success}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;