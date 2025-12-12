# 🚀 QuickServe - Smart Food Order Tracking System

A QR-based smart ordering & real-time tracking system for restaurants and small food outlets with comprehensive error handling and offline support.

**👤 Developer:** Gaurav Meena

---

## 🎯 Demo Credentials & Live Experience

### 🧑‍💼 **Customer Account**
- **Email:** `customer@demo.com`
- **Password:** `password123!`
- **Features to Explore:**
  - Browse 5 different restaurants with diverse cuisines
  - Place orders with realtime preparation timer
  - Track orders through all statuses (pending → processing → ready → completed)
  - Rate and review completed orders
  - Manage favorites and order history
  - Experience comprehensive error handling and offline support

### 👨‍🍳 **Shopkeeper Account**
- **Email:** `shopkeeper@demo.com`
- **Password:** `password123!`
- **Shop:** Burger Palace (Fully stocked with menu items)
- **Features to Explore:**
  - Manage incoming orders with preparation time setting
  - View real-time analytics and sales data
  - Update order statuses and track preparation times
  - Manage menu items and categories
  - View customer reviews and ratings
  - Generate QR codes for table ordering

### 🔗 **Live Demo**
- **Frontend:** https://capstone-03-quick-serve.vercel.app
- **Backend API:** Available after deployment

### 📊 **Demo Data Highlights**
- **5 Restaurants:** Burger Palace, Pizza Corner, Spice Garden, Taco Fiesta, Sushi Zen
- **16+ Menu Items:** Diverse cuisines with professional food images
- **6 Sample Orders:** Covering all order statuses for complete workflow testing
- **Customer Reviews:** Real reviews showcasing the rating system
- **Favorites System:** Pre-configured favorites for immediate testing

---

## 📱 Project Screenshots

### 🏠 **Customer Experience**

#### **Home Page - Browse Shops**
![Customer Home]
<img width="3024" height="1648" alt="image" src="https://github.com/user-attachments/assets/3f8ae005-16f3-435f-ad00-df9631082ba3" />
*Browse nearby restaurants with search, filters, and favorites*

#### **Shop Menu - Order Food**
![Shop Menu]
<img width="3024" height="1650" alt="image" src="https://github.com/user-attachments/assets/99c9b934-1f04-4d2c-a1e5-8639a3f2ecca" />


#### **Order Tracking - Real-time Updates**
![Order Tracking]
<img width="3024" height="1634" alt="image" src="https://github.com/user-attachments/assets/e4787e3c-2291-46b6-a529-3beff14c52b0" />


### 🏪 **Shopkeeper Dashboard**

#### **Dashboard - Analytics & Orders**
![Shopkeeper Dashboard]

<img width="3024" height="1724" alt="image" src="https://github.com/user-attachments/assets/e92d80d8-fd01-447e-ae30-d3e98aefca65" />

*Manage orders, view analytics, and track performance*

#### **Menu Management**
![Menu Management]
<img width="3024" height="1720" alt="image" src="https://github.com/user-attachments/assets/0aaa7f61-66e2-433f-a0ec-2a510537ec1c" />

## 🏗️ Tech Stack

### **Frontend**
- **Framework:** React 19.1.1 + Vite 7.1.7
- **Routing:** React Router DOM 7.10.0
- **Styling:** TailwindCSS 4.1.16 + Framer Motion 12.23.24
- **Icons:** Lucide React 0.552.0
- **QR Code:** qrcode.react 4.2.0
- **Testing:** Vitest 4.0.15 + Testing Library

### **Backend**
- **Runtime:** Node.js + Express 5.1.0
- **Database:** PostgreSQL + Prisma ORM 6.18.0
- **Authentication:** JWT (jsonwebtoken 9.0.2) + bcrypt 6.0.0
- **Testing:** Jest 30.2.0 + fast-check 4.4.0 (Property-Based Testing)
- **Development:** Nodemon 3.1.10

### **Database Schema**
- **ORM:** Prisma with PostgreSQL
- **Models:** User, Shop, Category, MenuItem, Order, OrderItem, Favorite, Review
- **Features:** Migrations, Seeding, Type Safety

### **DevOps & Deployment**
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render/Railway
- **Database:** Neon PostgreSQL (Cloud)
- **Version Control:** Git + GitHub

---

## ✨ Key Features

### 🛒 **Customer Features**
- ✅ **Browse Shops** - Search, filter by category/city, sort by rating/price
- ✅ **Shop Menu** - View categories, items with prices and images
- ✅ **Shopping Cart** - Add items, modify quantities, checkout
- ✅ **Order Placement** - Multiple payment methods (Card/UPI/Cash)
- ✅ **Order Tracking** - Real-time status with countdown timer
- ✅ **Order History** - View past orders and reorder
- ✅ **Favorites** - Save favorite restaurants
- ✅ **Reviews & Ratings** - Rate completed orders
- ✅ **Offline Support** - Dummy data fallback when API fails

### 🏪 **Shopkeeper Features**
- ✅ **Shop Management** - Create and manage shop profile
- ✅ **Menu Management** - CRUD operations for categories and items
- ✅ **Order Processing** - Real-time order notifications and status updates
- ✅ **Preparation Timer** - Set cooking time with countdown for customers
- ✅ **Analytics Dashboard** - Revenue, orders, customers, ratings
- ✅ **QR Code Generation** - Generate QR codes for customer access
- ✅ **Settings** - Manage shop settings and preferences

### 🔧 **Technical Features**
- ✅ **Comprehensive Error Handling** - Red error messages with retry options
- ✅ **Property-Based Testing** - 25+ tests with fast-check library
- ✅ **JWT Authentication** - Access + Refresh token mechanism
- ✅ **Real-time Updates** - Order status polling every 3 seconds
- ✅ **Responsive Design** - Mobile-first glassmorphism UI
- ✅ **API Fallback System** - Graceful degradation with dummy data
- ✅ **Database Seeding** - Rich dummy data for development/demo

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

## 🚀 Installation & Setup Guide

### Prerequisites:
- **Node.js** (v18+ recommended)
- **PostgreSQL** (v14+ or cloud database)
- **npm** or **yarn** package manager
- **Git** for version control

### 📋 **Step 1: Clone Repository**

```bash
git clone https://github.com/your-username/quickserve.git
cd quickserve
```

### 🗄️ **Step 2: Database Setup**

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL locally
# Create database
createdb quickserve

# Database URL format:
DATABASE_URL="postgresql://username:password@localhost:5432/quickserve"
```

#### Option B: Cloud Database (Recommended)
- **Neon:** https://neon.tech (Free tier available)
- **Supabase:** https://supabase.com (Free tier available)
- **Railway:** https://railway.app (PostgreSQL addon)

### ⚙️ **Step 3: Backend Setup**

```bash
cd Backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values:
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
PORT=4000

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with comprehensive demo data
npm run seed:data

# Verify demo data was created successfully
npm run verify:demo

# Start development server
npm run dev
```

### 🎨 **Step 4: Frontend Setup**

```bash
cd Frontend/quick_serve

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your backend URL:
VITE_PUBLIC_BACKEND_URL=http://localhost:4000

# Start development server
npm run dev
```

### 🚀 **Step 5: Access Application**

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000
- **Database:** Use Prisma Studio: `npx prisma studio`

### 🧪 **Step 6: Test with Demo Data**

```bash
# Backend: Seed database with demo data
cd Backend
npm run seed:data

# Use demo credentials:
# Customer: customer@demo.com / password123
# Shopkeeper: shopkeeper@demo.com / password123
```

### 🔧 **Development Commands**

#### Backend Commands:
```bash
npm run dev          # Start development server
npm run start        # Start production server
npm run test         # Run tests
npm run seed:data    # Seed database with comprehensive demo data
npm run seed:clear   # Clear all data
npm run seed:reset   # Clear and reseed data
npm run verify:demo  # Verify demo data integrity
```

#### Frontend Commands:
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Run ESLint
```

---

## 📱 Features Breakdown

### 🛒 **Customer Features:**
✅ **Browse Shops** - Search, filter by category/city, sort by rating/price  
✅ **Shop Discovery** - Pagination, favorites, detailed shop profiles  
✅ **Menu Browsing** - Categories, item details, images, prices  
✅ **Shopping Cart** - Add items, modify quantities, cart persistence  
✅ **Order Placement** - Multiple payment methods (Card/UPI/Cash)  
✅ **Order Tracking** - Real-time status with countdown timer  
✅ **Order History** - View past orders, reorder functionality  
✅ **Favorites Management** - Save and manage favorite restaurants  
✅ **Reviews & Ratings** - Rate completed orders, view shop ratings  
✅ **Error Handling** - Offline support with dummy data fallback  

### 🏪 **Shopkeeper Features:**
✅ **Shop Management** - Create and manage shop profile, settings  
✅ **Menu Management** - CRUD operations for categories and items  
✅ **Order Processing** - Real-time notifications, status updates  
✅ **Preparation Timer** - Set cooking time with customer countdown  
✅ **Analytics Dashboard** - Revenue, orders, customers, ratings  
✅ **QR Code Generation** - Generate QR codes for customer access  
✅ **Performance Insights** - Sales trends, popular items, peak hours  

### 🔧 **Technical Features:**
✅ **Comprehensive Error Handling** - Red error messages with retry options  
✅ **Property-Based Testing** - 25+ tests with fast-check library  
✅ **JWT Authentication** - Access + Refresh token mechanism  
✅ **Real-time Updates** - Order status polling every 3 seconds  
✅ **Responsive Design** - Mobile-first glassmorphism UI  
✅ **API Fallback System** - Graceful degradation with dummy data  
✅ **Database Seeding** - Rich dummy data for development/demo  

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

## 🔧 Troubleshooting

### Common Issues & Solutions:

#### **Backend Issues:**

**❌ Database Connection Error**
```bash
# Check your DATABASE_URL format
DATABASE_URL="postgresql://username:password@host:port/database"

# Test connection
npx prisma db pull
```

**❌ JWT Secret Error**
```bash
# Ensure JWT_SECRET is at least 32 characters
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
```

**❌ Port Already in Use**
```bash
# Kill process on port 4000
npx kill-port 4000

# Or use different port
PORT=4001
```

#### **Frontend Issues:**

**❌ API Connection Failed**
```bash
# Check backend URL in .env
VITE_PUBLIC_BACKEND_URL=http://localhost:4000

# Ensure backend is running
curl http://localhost:4000/api/health
```

**❌ Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npm run dev -- --force
```

#### **Database Issues:**

**❌ Migration Errors**
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

**❌ Seeding Errors**
```bash
# Clear and reseed database
npm run seed:reset
```

### **Getting Help:**
- Check browser console for frontend errors
- Check terminal logs for backend errors
- Use `npx prisma studio` to inspect database
- Test API endpoints with Postman/curl

---

## 🚀 Deployment

### ✅ Deployment Issues Fixed:
- Fixed JWT environment variables and CORS configuration
- Updated production start scripts and build processes
- Fixed security vulnerabilities in dependencies
- Added proper environment variable templates
- Fixed hardcoded URLs for dynamic deployment

### Backend Deployment (Railway/Render):
1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables (see DEPLOYMENT.md)
4. Deploy - build will run `prisma generate` automatically

### Frontend Deployment (Vercel):
1. Push code to GitHub
2. Connect repository to Vercel
3. Set `VITE_PUBLIC_BACKEND_URL` environment variable
4. Deploy - build optimized for production

### Database (Neon PostgreSQL):
✅ Already configured and connected
- SSL-enabled connection string
- Automatic migrations on deployment

### Live Deployment:
- **Frontend**: https://capstone-03-quick-serve.vercel.app
- **Backend**: Deploy using the deployment guide below

### Quick Deploy:
```bash
# 1. Deploy backend to Render/Railway (see DEPLOYMENT_CHECKLIST.md)
# 2. Update frontend environment:
node deploy-helper.js https://your-backend-url.onrender.com
# 3. Commit and push to trigger Vercel redeploy
git add . && git commit -m "Configure production" && git push
```

### Verification:
```bash
node verify-deployment.js
```

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

## 🏆 Project Achievements

### ✅ **Comprehensive Implementation**
- **Full-Stack Application** - Complete frontend and backend with database
- **Real-time Features** - Live order tracking with countdown timers
- **Error Handling** - Comprehensive error handling with offline support
- **Testing Coverage** - Property-based testing with 25+ test cases
- **Production Ready** - Deployed and accessible with demo credentials

### 🧪 **Testing & Quality**
- **Property-Based Testing** - Using fast-check library for robust testing
- **Unit Testing** - Jest for backend, Vitest for frontend
- **Error Scenarios** - Comprehensive error handling and fallback systems
- **Code Quality** - ESLint, proper project structure, clean code

### 🚀 **Advanced Features**
- **Preparation Timer System** - Real-time countdown for order preparation
- **Comprehensive Error Handling** - Red error messages with retry functionality
- **Dummy Data Fallback** - Graceful degradation when APIs are unavailable
- **Favorites System** - Customer can save and manage favorite restaurants
- **Analytics Dashboard** - Revenue tracking and performance insights

### 📱 **User Experience**
- **Glassmorphism UI** - Modern, beautiful interface design
- **Mobile Responsive** - Works perfectly on all device sizes
- **Smooth Animations** - Framer Motion for delightful interactions
- **Intuitive Navigation** - Easy-to-use customer and shopkeeper flows

---

## 📞 Contact

**Gaurav Meena**  
Student ID: 2401010169

---

**QuickServe v1.0.0** - Order Food, Skip the Wait! 🍔🚀
