require('dotenv').config()
const PORT = process.env.PORT || 4000
const express = require('express')
const cors = require('cors')

const authRoutes = require('./module/Auth/routes')
const shopRoutes = require('./module/Shop/routes')
const menuRoutes = require('./module/MenuManger/routes')
const customerRoutes = require('./module/Customer/routes')
const profileRoutes = require('./module/Profile/routes')
const app = express();
app.use(express.json())
app.use(cors())
app.get('/', (req, res) => res.send("QuickServe API is running ✅"))

app.use('/api/auth',authRoutes )
app.use('/api/shops',shopRoutes)
app.use('/api/menu',menuRoutes)
app.use('/api/customer',customerRoutes)
app.use('/api/profile',profileRoutes)

app.listen(PORT,()=>{
    console.log(`server has started ${PORT}`);
})
