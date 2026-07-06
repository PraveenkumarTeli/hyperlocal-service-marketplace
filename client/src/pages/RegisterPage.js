import { useState } from "react";
import API from "../api/axios";

function RegisterPage({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    phone: "",
    location: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await API.post("/auth/register", formData);
      setSuccess("Registration successful! You can now log in.");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: "100%", padding: "8px" }} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: "100%", padding: "8px" }} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required style={{ width: "100%", padding: "8px" }} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Register as</label>
          <select name="role" value={formData.role} onChange={handleChange} style={{ width: "100%", padding: "8px" }}>
            <option value="customer">Customer</option>
            <option value="provider">Provider</option>
          </select>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Phone</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={{ width: "100%", padding: "8px" }} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Location</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} style={{ width: "100%", padding: "8px" }} />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <button type="submit" style={{ padding: "10px 20px" }}>Register</button>
      </form>
    </div>
  );
}

export default RegisterPage;