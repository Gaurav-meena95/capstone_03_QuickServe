const prisma = require('../../config/prismaClient')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const sec_key = process.env.sec_key

async function signup(req, res) {
    try {
        const specialCharter = ['!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/',
            ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~']

        const { name, email, phone, password, role } = req.body
        if (!name || !email || !password || !role || !phone) {
            return res.status(401).json({ 'Error': 'All filed Required' })
        }
        if (!email.includes('@') || !email.includes('.com')) {
            return res.status(401).json({ message: "Invalid Email Address" })
        }
        const hasSpecialChar = specialCharter.some(char => password.includes(char))
        if (!hasSpecialChar || password.length < 8) {
            return res.status(401).json({
                message: "Password must contain at least one special character (!,@,#,<,>,*,^,%,...) and be at least 8 characters long"
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
        const existing = await prisma.user.findUnique({ where: { email, phone ,role} })

        if (!existing) {
            return res.status(404).json({ message: "User not found or Check your Role"})
        } else {
            const isPasswordMatch = bcrypt.compareSync(password, existing.password)
            if (isPasswordMatch  ) {
                const jwtToken = await jwt.sign({ email }, sec_key)
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