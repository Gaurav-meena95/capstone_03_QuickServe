const { use } = require('react')
const prisma = require('../../config/prismaClient')

const getProfile = async(req,res) =>{
    try {
        const {id} = req.user
        const user = await prisma.user.findUnique({where : {id}})
        return res.status(200).json({
            message :"user find successfully",
            user
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Internal Server Error'})
    }
}

const updateProfile = async(req,res) => {
    try {
        const {name , phone , }
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : 'Internal Server Error'})
        
    }
}