const prisma = require('../../config/prismaClient')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const sec_key = process.env.sec_key

async function signup(req, res) {
    try {
        const { name, email, phone, password, role } = req.body
        if (!name || !email || !password || !role || !phone) {
            return res.status(401).json({ 'Error': 'All filed Required' })
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(401).json({ message: "Invalid Email Address" })
        }
        if (!/(?=.*[!@#$%^&*])(?=.{8,})/.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long and contain one special character"
            });
        }

        const existing = await prisma.user.findUnique({ where: { email, phone } })
        if (existing) {
            return res.status(400).json({ message: 'User already exists' })
        }
        const hashedPass = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: {
                name: name,
                email: email,
                phone: phone,
                password: hashedPass,
                role: role
            }
        })
        console.log(user)
        return res.status(201).json({ message: 'Signup successful' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ 'error': 'Internal Server Error', error: error.message })
    }
}

async function login(req, res) {
    try {
        const { email, password, role, phone } = req.body
        const existing = await prisma.user.findUnique({ where: { email, phone, role } })

        if (!existing) {
            return res.status(404).json({ message: "User not found or Check your Role" })
        } else {
            const isPasswordMatch = bcrypt.compareSync(password, existing.password)
            if (isPasswordMatch) {
                const jwtToken = await jwt.sign(
                    { id: existing.id, email: existing.email, role: existing.role },
                    sec_key,
                    { expiresIn: "1h" }
                )
                return res.status(200).json({
                    message: "Login Successfully",
                    user: existing,
                    token: jwtToken
                });

            } else {
                return res.status(401).json({ message: 'Invalid credentials' })
            }

        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Login Faild', 'error': error.message })
    }

}

module.exports = { signup, login }