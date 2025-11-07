const prisma = require('../../config/prismaClient')
const jwt  = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const sec_key = process.env.sec_key

async function signup(req, res) {
    try {
        const { name, email, phone, password, role } = req.body
        if (!name || !email || !password || !role || !phone) {
            return res.status(401).json({ 'Error': 'All filed Required' })
        }
        if(!email.includes('@') || !email.includes('.com')){
            return res.status(401).json({message : "Invalid Email Address"})
        }
        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            return res.status(400).json({ message: 'User already exists' })
        }
        const hashedPass = await bcrypt.hash(password,10)
        console.log(hashedPass)
        const user = await prisma.user.create({
            data: {
                name: name,
                email: email,
                phone: phone,
                password: hashedPass,
                role: role
            }
        })

        return res.status(201).json({ message: 'Signup successful' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ 'error': 'Internal Server Error', error: error.message })
    }
}

async function login(req, res) {
    try {
        const { email, password, role } = req.body
        const existing = await prisma.user.findUnique({ where: { email } })
        if (!existing) {
            return res.status(404).json({ message: "User not found" })
        }else{
            const isPasswordMatch = bcrypt.compareSync(password,user.password)
            if (isPasswordMatch){
                const token = await jwt.sign({email} , sec_key)
                return res.json({token})
            }else{
                 return res.status(401).json({ message: 'Invalid credentials' })
            }

        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Login Faild', 'error': error.message })
    }

}

module.exports = { signup, login }