require('dotenv').config()
const PORT = process.env.PORT || 4000
const express = require('express')
const cors = require('cors')

const authRoutes = require('./module/Auth/routes')
const shopRoutes = require('./module/Shop/routes')
const menuRoutes = require('./module/MenuManger/routes')
const customerRoutes = require('./module/Customer/routes')
const profileRoutes = require('./module/Profile/routes')
const notificationRoutes = require('./module/Notification/routes')
const reviewRoutes = require('./module/Review/routes')
const adminRoutes = require('./module/Admin/routes')
const { startCleanupScheduler } = require('./utils/cleanupOrders')
const app = express();
// Increase payload size limit for image uploads (base64 images can be large)
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Configure CORS for production
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:3000', 
        'https://capstone-03-quick-serve.vercel.app',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token'],
    exposedHeaders: ['x-access-token', 'x-refresh-token']
}

app.use(cors(corsOptions))
app.get('/', (req, res) => res.send("QuickServe API is running ✅"))

app.use('/api/auth',authRoutes )
app.use('/api/shops',shopRoutes)
app.use('/api/menu',menuRoutes)
app.use('/api/customer',customerRoutes)
app.use('/api/profile',profileRoutes)
app.use('/api/notifications',notificationRoutes)
app.use('/api/reviews',reviewRoutes)
app.use('/api/admin',adminRoutes)

app.listen(PORT,()=>{
    console.log(`server has started ${PORT}`);
    startCleanupScheduler();
})
