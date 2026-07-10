# Hyperlocal Service Marketplace

A full-stack web platform connecting customers with local service providers (electricians, plumbers, tutors, and more) — inspired by real-world platforms like Urban Company, built as a learning/academic project.

🔗 **Live Demo:** [hyperlocal-service-marketplace-henna.vercel.app](https://hyperlocal-service-marketplace-henna.vercel.app)
🔗 **Backend API:** [hyperlocal-marketplace-api.onrender.com](https://hyperlocal-marketplace-api.onrender.com)

> Note: The backend is hosted on a free tier, so the first request after inactivity may take 30–50 seconds to respond while the server wakes up.

---

## Overview

This platform supports three distinct user roles — **Customer**, **Service Provider**, and **Admin** — each with their own dashboard and permissions:

- **Customers** can browse approved services, book a time slot, and track their bookings.
- **Providers** can list services, edit them, and manage incoming bookings (accept, reject, mark completed).
- **Admins** review and approve new service listings before they go live, maintaining quality control on the platform.

## Key Features

- 🔐 **JWT-based authentication** with bcrypt password hashing
- 👥 **Role-based access control**, enforced via backend middleware (not just frontend routing)
- 📅 **Booking conflict prevention** — a provider cannot be double-booked for the same date and time slot
- ✅ **Admin approval workflow** for new (and edited) service listings
- 💰 **Price/title snapshotting** — bookings retain the price and service name agreed at the time of booking, even if the provider edits the service later
- 🔄 **Full booking lifecycle** — pending → accepted/rejected → completed/cancelled
- ✏️ **Provider service editing**, with automatic re-approval requirement on changes

## Tech Stack

**Frontend:** React, React Context API, Axios, CSS
**Backend:** Node.js, Express.js
**Database:** MongoDB (Mongoose), hosted on MongoDB Atlas
**Auth:** JWT (JSON Web Tokens), bcrypt
**Deployment:** Vercel (frontend), Render (backend)


## Project Structure

- `client/` — React frontend (pages, components, API calls, auth context)
- `server/` — Express backend (models, routes, middleware)
## Core Design Decisions

- **Single User model with a `role` field** (customer/provider/admin) rather than separate collections per role — simpler schema, single source of truth for authentication.
- **Resource-level ownership checks** on top of role-based middleware — e.g., a provider can only edit their own services, verified by comparing the resource's owner ID against the JWT's user ID.
- **Booking conflict detection** checks for existing bookings with the same provider, date, and time slot where status is `pending` or `accepted` — cancelled/rejected bookings don't block new ones.

## Running Locally

**Backend:**
```bash
cd server
npm install
# create a .env file with MONGO_URI, JWT_SECRET, PORT
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm start
```

## Future Enhancements

- Payment integration (Razorpay)
- Location-based provider search
- Ratings and reviews for completed bookings
- Email/SMS notifications for booking status changes

---

Built by Praveenkumar Teli

