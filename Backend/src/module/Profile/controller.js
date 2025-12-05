const prisma = require('../../config/prismaClient')

const getProfile = async(req,res) =>{
    try {
        const {id} = req.user
        const user = await prisma.user.findUnique({
            where: {id},
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                avatar: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        })
        
        if (!user) {
            return res.status(404).json({message: 'User not found'})
        }
        
        return res.status(200).json({
            message: "Profile retrieved successfully",
            user
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({message: 'Internal Server Error'})
    }
}

const updateProfile = async(req,res) => {
    try {
        const {id} = req.user
        const {name, phone, avatar} = req.body
        
        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({message: 'Name is required'})
        }
        
        // Validate phone if provided
        if (phone && phone.length !== 10) {
            return res.status(400).json({message: 'Phone must be 10 digits'})
        }
        
        // Update user profile
        const updatedUser = await prisma.user.update({
            where: {id},
            data: {
                name: name.trim(),
                phone: phone || null,
                avatar: avatar || null
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                avatar: true,
                role: true,
                updatedAt: true
            }
        })
        
        return res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: 'Internal Server Error'})
    }
}

module.exports = {getProfile, updateProfile}