🚀 QuickServe :– Smart Food Order Tracking System

A QR-based smart ordering & real-time tracking system for restaurants and small food outlets.

👤 Developer :- Gaurav Meena (2401010169)

 ------: Problem Statement :-------

Local restaurants and small food outlets often face challenges in managing customer orders efficiently during rush hours. Customers, on the other hand, have no visibility into their order status once placed. QuickServe aims to solve this by providing a QR-based food ordering and tracking system where customers can view the live menu, place an order, make online payment, and get a token number with an estimated preparation time and real-time updates when the order is ready.

 ------------------: System Architecture :----------------

Describe or diagram your project structure, e.g.:
Frontend → Backend (API) → Database
Tech Stack:
●   Frontend: React.js, React Router, Axios, TailwindCSS
●   Backend: Node.js + Express
●   Database: MySQL (Relational) using Prisma ORM
●   Authentication: JWT-based login/signup (Customer & Shopkeeper roles)
●   Hosting:○ Frontend → Netlify/Vercel
            ○ Backend → Render/Railway
            ○ Database → PlanetScale / Neon / Aiven MySQL Cloud



 ------------------: Key Features :----------------
 | **Category**                   | **Features**                                                            |
| ------------------------------ | ----------------------------------------------------------------------- |
| Authentication & Authorization | Secure user/shopkeeper login, signup using JWT                          |
| CRUD Operations                | Add/Edit/Delete food items, manage menus & orders                       |
| Frontend Routing               | Home, Login, Dashboard, Menu, Order Details, Profile pages.             |
| Customer Features              | Scan QR → View menu → Place order → Get token → Track order status      |
| Advance Features               | Filtering,sorting, searching menu items, live token updates             |
| Shopkeeper Features            | Manage products, update order status (preparing, ready, completed)      |
| Hosting                        | Fully deployed frontend and backend with connected MySQL cloud database |



------------------:  API Overview :----------------

| **Endpoint**                | **Method** | **Description**                     | **Access**    |
| --------------------------- | ---------- | ----------------------------------- | ------------- |
| /api/auth/signup            | POST       | Register new user/shopkeeper        | Public        |
| /api/auth/login             | POST       | Authenticate user                   | Public        |
| /api/products               | GET        | Fetch all available products        | Authenticated |
| /api/products               | POST       | Add a new product                   | Shopkeeper    |
| /api/orders                 | POST       | Place a new order                   | Customer      |
| /api/orders/:id             | PUT        | Update order status                 | Shopkeeper    |
| /api/orders/:id             | DELETE     | Delete order                        | Admin only    |
| /api/products/filter?type=  | GET        | Filter menu items by category/type  | Authenticated |
| /api/products/sort?by=      | GET        | Sort products by price or rating    | Authenticated |
| /api/products?page=&limit=  | GET        | Paginate product list results       | Authenticated |
| /api/products/search?query= | GET        | Search products by name or category | Authenticated |


QuickServe v1.0.0