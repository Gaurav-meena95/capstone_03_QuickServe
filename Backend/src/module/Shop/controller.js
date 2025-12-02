
const service = require('./service')
exports.createShop = async(req,res)=>{
    try {
        console.log('kjdfha yha to aa ya')
        console.log("object",req.body)
        const shop = await service.createShopForUser(req.user.id,req.body)
        return res.status(201).json({msg:'Shop create Successfully',shop})
    } catch (error) {
        console.log(error)
        return res.status(500).json({msg :'Internal Server Error'})
        
    }
}
// exports.getMyShop = async(req,res) => {
//     try {
//         const myShop = await service.getShopbyUserId(req.user.id)
//         if(!myShop){
//             return res.status(404).json({msg : "No shop found for this account"})
//         }
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({msg : "Internal Server Error"})
//     }
// }
