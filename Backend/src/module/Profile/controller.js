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

const getUserStats = async(req,res) => {
    try {
        const {id, role} = req.user
        
        if (role === 'CUSTOMER') {
            // Get customer statistics
            const orders = await prisma.order.findMany({
                where: { customerId: id },
                select: {
                    id: true,
                    total: true,
                    status: true
                }
            })
            
            const totalOrders = orders.length
            const totalSpent = orders
                .filter(order => order.status !== 'CANCELLED')
                .reduce((sum, order) => sum + order.total, 0)
            
            // Get customer reviews/ratings given
            const reviews = await prisma.review.findMany({
                where: { userId: id },
                select: { rating: true }
            })
            
            const avgRating = reviews.length > 0 
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
                : 0
            
            return res.status(200).json({
                success: true,
                stats: {
                    totalOrders,
                    totalSpent,
                    avgRating: parseFloat(avgRating.toFixed(1)),
                    totalReviews: reviews.length
                }
            })
        } else if (role === 'SHOPKEEPER') {
            // Get shop statistics
            const shop = await prisma.shop.findUnique({
                where: { shopkeeperId: id },
                select: {
                    id: true,
                    rating: true,
                    totalRatings: true
                }
            })
            
            if (!shop) {
                return res.status(404).json({
                    success: false,
                    message: 'Shop not found'
                })
            }
            
            const orders = await prisma.order.findMany({
                where: { shopId: shop.id },
                select: {
                    id: true,
                    total: true,
                    status: true
                }
            })
            
            const totalOrders = orders.length
            const totalRevenue = orders
                .filter(order => order.status === 'COMPLETED')
                .reduce((sum, order) => sum + order.total, 0)
            
            return res.status(200).json({
                success: true,
                stats: {
                    totalOrders,
                    totalRevenue,
                    rating: shop.rating,
                    totalRatings: shop.totalRatings
                }
            })
        }
        
        return res.status(400).json({
            success: false,
            message: 'Invalid user role'
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

module.exports = {getProfile, updateProfile, getUserStats}