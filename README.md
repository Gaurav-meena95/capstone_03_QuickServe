🚀 QuickServe – Smart Food Order Tracking System

A QR-based smart ordering & real-time tracking system for restaurants and small food outlets.

👤 Developer

Gaurav Meena (2401010169)

🧠 Problem Statement

Local restaurants and small food outlets often face challenges in managing customer orders efficiently during rush hours. Customers, on the other hand, have no visibility into their order status once placed. QuickServe aims to solve this by providing a QR-based food ordering and tracking system where customers can view the live menu, place an order, make online payment, and get a token number with an estimated preparation time and real-time updates when the order is ready.

🏗️ System Architecture
Frontend (React) → Backend (Express API) → Database (MySQL + Prisma ORM)

🛠️ Tech Stack
Frontend

React.js

React Router

Axios

TailwindCSS

Backend

Node.js

Express.js

JWT Authentication

Prisma ORM

Database

MySQL (PlanetScale / Neon / Aiven)

Hosting

Frontend hosted on Netlify/Vercel

Backend hosted on Render/Railway

Database hosted on PlanetScale / Neon / Aiven

🧩 Key Features

Secure user/shopkeeper login & signup using JWT

Add/Edit/Delete food items

View menu via QR scan

Place orders directly

Token number generation per order

Real-time tracking of order status

Sorting / Searching / Filtering of menu

Shopkeeper dashboard for order management

Fully cloud-deployed frontend, backend & database

🧾 API Endpoints
Authentication
POST   /api/auth/signup
POST   /api/auth/login

Products
GET    /api/products
POST   /api/products                 (Shopkeeper only)
GET    /api/products/filter?type=
GET    /api/products/sort?by=
GET    /api/products?page=&limit=
GET    /api/products/search?query=

Orders
POST   /api/orders                   (Customer)
PUT    /api/orders/:id               (Shopkeeper)
DELETE /api/orders/:id               (Admin only)

🧪 Evaluation Checklist

✔ Hosted frontend URL working
✔ Hosted backend URL working
✔ Database connected to production DB
✔ Signup inserts hashed password
✔ Login returns JWT
✔ JWT validates at jwt.io
✔ API working via live production URL
✔ README includes hosted URLs
✔ Proposal included

📎 Project Proposal Included

Original project proposal file included:
GAURAV MEENA ap_capstone.pdf

📌 Version

QuickServe v1.0.0