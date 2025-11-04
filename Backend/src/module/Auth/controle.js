const prisma = require('../../config/prismaClient')
const { use } = require('./auth')
async function signup(req, res) {
    try {
        const { name, email, phone, password, role } = req.body
        if (!name || !email || !password || !role || !phone) {
            return res.status(401).json({ 'Error': 'All filed Required' })
        }
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            return res.status(400).json({ message: 'User already exists' })
        }
        const user = await prisma.user.create({
            data: {
                name: name,
                email: email,
                phone: phone,
                password: password,
                role: role
            }
        })
        return res.status(201).json({ message: 'Signup successful' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ 'error': 'Internal Server Error', error: error.message })
    }
}
module.exports = { signup }