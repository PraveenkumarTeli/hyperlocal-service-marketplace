import { useState, useEffect, useCallback } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

function CustomerDashboard() {
  const { user, logout } = useAuth();
  const [services, setServices] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [ratings, setRatings] = useState({});
  const [myReviewedBookings, setMyReviewedBookings] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");

  const [ratingBookingId, setRatingBookingId] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [hoverValue, setHoverValue] = useState(0); // for star hover preview

  // --- search & filter state ---
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [categories, setCategories] = useState([]);

  const fetchServices = useCallback(async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      if (locationFilter) params.location = locationFilter;

      const res = await API.get("/services", { params });
      setServices(res.data);
      res.data.forEach((service) => fetchRating(service._id));
    } catch (err) {
      console.log(err);
    }
  }, [searchTerm, categoryFilter, locationFilter]);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/services/categories");
      setCategories(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchMyBookings();
    fetchReviewedBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce so we don't hit the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 350);
    return () => clearTimeout(timer);
  }, [fetchServices]);

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setLocationFilter("");
  };

  const fetchReviewedBookings = async () => {
    try {
      const res = await API.get("/reviews/my-reviewed-bookings");
      setMyReviewedBookings(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchRating = async (serviceId) => {
    try {
      const res = await API.get(`/reviews/service/${serviceId}`);
      setRatings((prev) => ({ ...prev, [serviceId]: res.data }));
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
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await API.post("/bookings", { serviceId, bookingDate, timeSlot });
      setSuccessMsg("Booking created successfully!");
      setSelectedServiceId(null);
      setBookingDate("");
      setTimeSlot("");
      fetchMyBookings();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Booking failed");
    }
  };

  const handleSubmitRating = async (bookingId) => {
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await API.post("/reviews", { bookingId, rating: ratingValue });
      setSuccessMsg("Thanks for your rating!");
      setRatingBookingId(null);
      setRatingValue(5);
      setMyReviewedBookings((prev) => [...prev, bookingId]);
      fetchServices();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to submit rating");
    }
  };

  const badgeClass = (status) => `badge badge-${status}`;

  return (
    <div className="page-wrapper">
      <div className="navbar">
        <h2>Customer Dashboard</h2>
        <div>
          <span className="navbar-user">Welcome, {user?.name}</span>
          <button onClick={logout} className="btn btn-logout">Logout</button>
        </div>
      </div>

      <div className="container">
        {successMsg && <p className="alert alert-success">{successMsg}</p>}
        {errorMsg && <p className="alert alert-error">{errorMsg}</p>}

        <h3 className="section-title">Available Services</h3>

        <div className="filter-bar">
          <input
            type="text"
            className="form-control"
            placeholder="Search by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-control"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="text"
            className="form-control"
            placeholder="Location (e.g. Bangalore)"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
          {(searchTerm || categoryFilter || locationFilter) && (
            <button onClick={clearFilters} className="btn btn-secondary btn-sm">Clear</button>
          )}
        </div>

        {services.length === 0 && (
          <p className="empty-text">
            {searchTerm || categoryFilter || locationFilter
              ? "No services match your search."
              : "No services available yet."}
          </p>
        )}

        {services.map((service) => (
          <div key={service._id} className="card">
            <h4>{service.title}</h4>
            <p>Category: {service.category}</p>
            <p>Price: ₹{service.price}</p>
            <p>Provider: {service.providerId?.name} ({service.providerId?.location})</p>
            <p>
              {ratings[service._id]?.averageRating
                ? `⭐ ${ratings[service._id].averageRating} (${ratings[service._id].count} review${ratings[service._id].count > 1 ? "s" : ""})`
                : "No ratings yet"}
            </p>

            {selectedServiceId === service._id ? (
              <div className="inline-inputs">
                <input type="date" className="form-control" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
                <input type="text" className="form-control" placeholder="e.g. 10:00-11:00" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} />
                <button onClick={() => handleBook(service._id)} className="btn btn-success btn-sm">Confirm</button>
                <button onClick={() => setSelectedServiceId(null)} className="btn btn-secondary btn-sm">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setSelectedServiceId(service._id)} className="btn btn-primary btn-sm">Book Now</button>
            )}
          </div>
        ))}

        <h3 className="section-title">My Bookings</h3>
        {myBookings.length === 0 && <p className="empty-text">You have no bookings yet.</p>}

        {myBookings.map((booking) => (
          <div key={booking._id} className="card">
            <h4>{booking.serviceTitleAtBooking || booking.serviceId?.title}</h4>
            <p>
              Provider: {booking.providerId?.name} —{" "}
              <a href={`tel:${booking.providerId?.phone}`} className="phone-link">
                {booking.providerId?.phone}
              </a>
            </p>
            <p>{booking.bookingDate} | {booking.timeSlot} | ₹{booking.priceAtBooking}</p>
            <span className={badgeClass(booking.status)}>{booking.status}</span>

            {booking.status === "completed" && !myReviewedBookings.includes(booking._id) && (
              <div style={{ marginTop: "10px" }}>
                {ratingBookingId === booking._id ? (
                  <div className="inline-inputs" style={{ alignItems: "center" }}>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${star <= (hoverValue || ratingValue) ? "star-filled" : ""}`}
                          onClick={() => setRatingValue(star)}
                          onMouseEnter={() => setHoverValue(star)}
                          onMouseLeave={() => setHoverValue(0)}
                          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <button onClick={() => handleSubmitRating(booking._id)} className="btn btn-success btn-sm">Submit</button>
                    <button onClick={() => setRatingBookingId(null)} className="btn btn-secondary btn-sm">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setRatingBookingId(booking._id)} className="btn btn-secondary btn-sm">Rate this service</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomerDashboard;