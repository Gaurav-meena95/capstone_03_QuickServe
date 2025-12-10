const prisma = require('../../config/prismaClient')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { CLIENT_RENEG_LIMIT } = require('tls')
const sec_key = process.env.sec_key

async function signup(req, res) {
    try {
        const { name, email, phone, password, role } = req.body
        console.log(req.body)
        if (!name || !email || !password || !role || !phone) {
            return res.status(401).json({ 'Error': 'All filed Required' })
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(401).json({ message: "Invalid Email Address" })
        }
        // Validate phone number - must be exactly 10 digits
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ 
                message: "Phone number must be exactly 10 digits" 
            });
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
        
        // Generate JWT tokens (same as login)
        const jwtToken = await jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            sec_key,
            { expiresIn: '1h' }
        )
        const refreshToken = await jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            sec_key,
            { expiresIn: '7d' }
        )
        
        console.log(user)
        return res.status(201).json({ 
            message: 'Signup successful',
            user: user,
            token: jwtToken,
            refreshToken
        })
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
                    { expiresIn: '1h' }
                )
                const refreshToken = await jwt.sign(
                    { id: existing.id, email: existing.email, role: existing.role },
                    sec_key,
                    { expiresIn: '7d' }
                )
                return res.status(200).json({
                    message: "Login Successfully",
                    user: existing,
                    token: jwtToken,
                    refreshToken
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


async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.status(200).json({ 
                message: 'If an account exists with this email, a password reset link has been sent' 
            });
        }

        // Generate unique reset token
        const resetToken = require('crypto').randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Store hashed token in database
        const hashedToken = await bcrypt.hash(resetToken, 10);
        await prisma.user.update({
            where: { email },
            data: {
                resetToken: hashedToken,
                resetTokenExpiry
            }
        });

        const frontend = process.env.FRONTEND_URL;
        const resetUrl = `${frontend}/reset-password?token=${resetToken}&email=${email}`;
        
        return res.status(200).json({ 
            message: 'Password reset link has been sent',
            // Only include resetUrl in development
            resetUrl: process.env.NODE_ENV === 'production' ? undefined : resetUrl,
            devNote: process.env.NODE_ENV === 'production' ? undefined : 'Copy this URL to reset your password'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to process password reset request', error: error.message });
    }
}

async function resetPassword(req, res) {
    try {
        const { email, token, newPassword } = req.body;

        if (!email || !token || !newPassword) {
            return res.status(400).json({ message: 'Email, token, and new password are required' });
        }

        // Validate password strength
        if (!/(?=.*[!@#$%^&*])(?=.{8,})/.test(newPassword)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long and contain one special character"
            });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.resetToken || !user.resetTokenExpiry) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Check if token has expired
        if (new Date() > user.resetTokenExpiry) {
            return res.status(400).json({ message: 'Reset token has expired' });
        }

        // Verify token
        const isTokenValid = await bcrypt.compare(token, user.resetToken);
        if (!isTokenValid) {
            return res.status(400).json({ message: 'Invalid reset token' });
        }

        // Hash new password and update user
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        return res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to reset password', error: error.message });
    }
}

module.exports = { signup, login, forgotPassword, resetPassword }