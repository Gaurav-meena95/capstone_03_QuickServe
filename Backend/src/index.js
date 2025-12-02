require('dotenv').config()
const PORT = process.env.PORT || 4000
const prisma = require('./config/prismaClient')
const express = require('express')
const cors = require('cors')

const authRoutes = require('./module/Auth/routes')

const app = express();
app.use(express.json())
app.use(cors())
app.get('/', (req, res) => res.send("QuickServe API is running ✅"))

app.use('/api/auth',authRoutes )

app.listen(PORT,()=>{
    console.log(`server has started ${PORT}`);
})
