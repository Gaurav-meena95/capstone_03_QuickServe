# 🚀 QuickServe - Smart Food Order Tracking System

A QR-based smart ordering & real-time tracking system for restaurants and small food outlets.

**👤 Developer:** Gaurav Meena (2401010169)

---

## 📋 Problem Statement

Local restaurants and small food outlets often face challenges in managing customer orders efficiently during rush hours. Customers, on the other hand, have no visibility into their order status once placed. QuickServe aims to solve this by providing a QR-based food ordering and tracking system where customers can view the live menu, place an order, make online payment, and get a token number with an estimated preparation time and real-time updates when the order is ready.

---

## 🏗️ System Architecture

```
Frontend (React + Vite) → Backend (Node.js + Express) → Database (PostgreSQL + Prisma)
```

### Tech Stack:
- **Frontend:** React.js, React Router v6, Framer Motion, TailwindCSS
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (Relational) using Prisma ORM
- **Authentication:** JWT-based login/signup (Customer & Shopkeeper roles)
- **Hosting:**
  - Frontend → Netlify/Vercel
  - Backend → Render/Railway
  - Database → Neon / Supabase / Railway PostgreSQL

---

## ✨ Key Features

| **Category**                   | **Features**                                                                 |
| ------------------------------ | ---------------------------------------------------------------------------- |
| Authentication & Authorization | Secure user/shopkeeper login, signup using JWT with refresh tokens          |
| CRUD Operations                | Add/Edit/Delete food items, manage menus, categories & orders                |
| Frontend Routing               | Home, Login, Dashboard, Menu, Order Tracking, Profile, Analytics pages      |
| Customer Features              | Browse shops → View menu → Add to cart → Place order → Get token → Track    |
| Advanced Features              | Filtering, sorting, searching, pagination, real-time order status updates    |
| Shopkeeper Features            | Manage shop, products, update order status, view analytics, generate QR code |
| Hosting                        | Fully deployed frontend and backend with connected PostgreSQL cloud database |

---

## 🎯 User Flows

### Customer Flow:
1. **Browse Shops** - Search, filter by category/city, sort by rating/price
2. **View Menu** - Browse categories, view items with prices and images
3. **Add to Cart** - Select items and quantities
4. **Checkout** - Choose payment method (Card/UPI/Cash) and order type
5. **Place Order** - Receive unique token (e.g., TKN1234567890ABC)
6. **Track Order** - Real-time status updates (Pending → Confirmed → Preparing → Ready)
7. **Pickup** - Show token at counter and collect order

### Shopkeeper Flow:
1. **Sign Up** - Create shopkeeper account
2. **Create Shop** - Add shop details, address, hours, category
3. **Add Menu** - Create categories and menu items with prices
4. **Receive Orders** - Get notified of new orders
5. **Process Orders** - Update status: Confirm → Prepare → Ready → Complete
6. **View Analytics** - Track revenue, orders, customers, ratings
7. **Generate QR** - Create QR code for customers to scan

---

## 📡 API Endpoints

### Authentication:
| **Endpoint**       | **Method** | **Description**              | **Access** |
| ------------------ | ---------- | ---------------------------- | ---------- |
| /api/auth/signup   | POST       | Register new user/shopkeeper | Public     |
| /api/auth/login    | POST       | Authenticate user            | Public     |

### Customer APIs:
| **Endpoint**                        | **Method** | **Description**                                  | **Access**    |
| ----------------------------------- | ---------- | ------------------------------------------------ | ------------- |
| /api/customer/shops                 | GET        | Get all shops (filters, search, sort, paginate) | Authenticated |
| /api/customer/shops/:slug           | GET        | Get shop menu by slug                            | Authenticated |
| /api/customer/orders                | POST       | Place a new order                                | Customer      |
| /api/customer/orders                | GET        | Get customer's orders                            | Customer      |
| /api/customer/orders/:id            | GET        | Get order by ID                                  | Customer      |
| /api/customer/orders/track/:token   | GET        | Track order by token (public)                    | Public        |
| /api/customer/favorites             | POST       | Add shop to favorites                            | Customer      |
| /api/customer/favorites/:shopId     | DELETE     | Remove from favorites                            | Customer      |
| /api/customer/favorites             | GET        | Get favorite shops                               | Customer      |

**Query Parameters for /api/customer/shops:**
- `?city=Mumbai` - Filter by city
- `&category=Fast Food` - Filter by category
- `&search=burger` - Search by name/description
- `&sortBy=rating|price_low|distance` - Sort results
- `&page=1&limit=10` - Pagination

### Shopkeeper APIs:
| **Endpoint**                        | **Method** | **Description**           | **Access**  |
| ----------------------------------- | ---------- | ------------------------- | ----------- |
| /api/shops                          | POST       | Create shop               | Shopkeeper  |
| /api/shops/me                       | GET        | Get my shop               | Shopkeeper  |
| /api/shops/me                       | PATCH      | Update my shop            | Shopkeeper  |
| /api/shops/dashboard                | GET        | Get dashboard data        | Shopkeeper  |
| /api/shops/orders/:orderId/status   | PATCH      | Update order status       | Shopkeeper  |

### Menu APIs:
| **Endpoint**            | **Method** | **Description**           | **Access**  |
| ----------------------- | ---------- | ------------------------- | ----------- |
| /api/menu               | GET        | Get my menu items         | Shopkeeper  |
| /api/menu               | POST       | Create menu item          | Shopkeeper  |
| /api/menu/:id           | PATCH      | Update menu item          | Shopkeeper  |
| /api/menu/:id           | DELETE     | Delete menu item          | Shopkeeper  |
| /api/menu/:id/toggle    | PATCH      | Toggle item availability  | Shopkeeper  |

---

## 🗄️ Database Schema

### Main Models:

**User**
- id, email, password, name, phone, role (CUSTOMER/SHOPKEEPER), avatar

**Shop**
- id, name, description, slug, category, image, logo, status, rating, totalRatings
- address, city, pincode, state, openingTime, closingTime
- shopkeeperId (FK to User)

**Category**
- id, name, description, image, order, shopId (FK to Shop)

**MenuItem**
- id, name, description, price, image, available, popular
- shopId (FK to Shop), categoryId (FK to Category)

**Order**
- id, token, orderNumber, status, orderType, scheduledTime
- subtotal, discount, total, paymentMethod, paymentStatus
- customerId (FK to User), shopId (FK to Shop)
- placedAt, confirmedAt, preparingAt, readyAt, completedAt, cancelledAt

**OrderItem**
- id, orderId (FK to Order), menuItemId (FK to MenuItem)
- quantity, price, subtotal, notes

**Favorite**
- userId (FK to User), shopId (FK to Shop)

### Order Status Flow:
```
PENDING → CONFIRMED → PREPARING → READY → COMPLETED
                  ↓
              CANCELLED
```

---

## 🚀 Installation & Setup

### Prerequisites:
- Node.js (v16+)
- PostgreSQL
- npm or yarn

### Backend Setup:

```bash
cd Backend
npm install

# Create .env file
DATABASE_URL="postgresql://user:password@localhost:5432/quickserve"
JWT_SECRET="your-secret-key"
PORT=4000

# Run Prisma migrations
npx prisma generate
npx prisma migrate dev

# Start backend server
npm start
```

### Frontend Setup:

```bash
cd Frontend/quick_serve
npm install

# Create .env file
VITE_PUBLIC_BACKEND_URL=http://localhost:4000

# Start frontend
npm run dev
```

---

## 📱 Features Breakdown

### Customer Features:
✅ Browse shops with filters (city, category)  
✅ Search shops by name/description  
✅ Sort by rating, price, distance  
✅ Pagination for shop listings  
✅ View shop menu with categories  
✅ Add items to cart  
✅ Place orders with payment options  
✅ Receive unique order token  
✅ Real-time order tracking  
✅ Order history  
✅ Favorites management  

### Shopkeeper Features:
✅ Create and manage shop profile  
✅ Menu management (CRUD operations)  
✅ Category management  
✅ Real-time order notifications  
✅ Update order status  
✅ Dashboard with statistics  
✅ Analytics (revenue, orders, customers)  
✅ QR code generation  
✅ Shop settings  

---

## 🎨 UI/UX Features

- **Glassmorphism Design** - Modern glass effect UI
- **Smooth Animations** - Framer Motion animations
- **Responsive Design** - Mobile-first approach
- **Dark Theme** - Eye-friendly dark mode
- **Loading States** - Skeleton loaders
- **Error Handling** - User-friendly error messages
- **Toast Notifications** - Real-time feedback
- **Bottom Navigation** - Easy mobile navigation

---

## 🔐 Security Features

- JWT-based authentication
- Access token + Refresh token mechanism
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Protected API routes
- Input validation
- SQL injection prevention (Prisma ORM)

---

## 📊 Analytics & Insights

Shopkeepers can view:
- Total revenue from completed orders
- Total orders count
- Unique customers
- Average rating
- Weekly sales chart
- Top-selling products
- Peak order hours
- Category distribution

---

## 🔄 Real-Time Features

- Order status updates (polling every 5 seconds)
- Live order tracking
- Instant notifications
- Real-time dashboard updates

---

## 🚀 Deployment

### Backend Deployment (Railway/Render):
1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify):
1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Set VITE_PUBLIC_BACKEND_URL
4. Deploy

### Database (Neon/Supabase):
1. Create PostgreSQL database
2. Copy connection string
3. Update DATABASE_URL in backend .env
4. Run migrations

---

## 📝 Environment Variables

### Backend (.env):
```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your_super_secret_key_here
PORT=4000
```

### Frontend (.env):
```env
VITE_PUBLIC_BACKEND_URL=http://localhost:4000
```

---

## 🧪 Testing

### Test Customer Flow:
1. Sign up as customer
2. Browse shops
3. Select shop and add items
4. Place order
5. Track order with token

### Test Shopkeeper Flow:
1. Sign up as shopkeeper
2. Create shop
3. Add menu items
4. Receive customer order
5. Update order status
6. View analytics

---

## 📦 Project Structure

```
QuickServe/
├── Backend/
│   ├── src/
│   │   ├── module/
│   │   │   ├── Auth/
│   │   │   ├── Shop/
│   │   │   ├── Customer/
│   │   │   └── MenuManger/
│   │   ├── config/
│   │   └── index.js
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
└── Frontend/
    └── quick_serve/
        ├── src/
        │   ├── components/
        │   │   ├── Customer/
        │   │   ├── Shopkeeper/
        │   │   └── auth/
        │   ├── App.jsx
        │   └── main.jsx
        └── package.json
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- Framer Motion for smooth animations
- Lucide React for beautiful icons
- Prisma for excellent ORM
- Tailwind CSS for utility-first styling

---

## 📞 Contact

**Gaurav Meena**  
Student ID: 2401010169

---

**QuickServe v1.0.0** - Order Food, Skip the Wait! 🍔🚀
