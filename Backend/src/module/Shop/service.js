const  prisma  = require('../../config/prismaClient')

exports.createShopForUser = async (userId, payload) => {
    console.log(payload)
    const exsiting = await prisma.shop.findUnique({ where: { shopkeeperId: userId } });
    if (exsiting) {
        throw new Error('Shop already exists for this shopkeeper')
    }
    if (!payload.name || !payload.category || !payload.address || !payload.city || !payload.pincode) {
        throw new Error("Missing required fields: name, category, address, city, pincode");
    }
    const shop = await prisma.shop.create({
        data: {
            name: payload.name,
            description: payload.description,
            category: payload.category,
            image: payload.image || null,
            logo: payload.logo || null,
            pincode: payload.pincode,
            address: payload.address,
            city: payload.city,
            state: payload.state || null,
            openingTime: payload.openingTime || "09:00",
            closingTime: payload.closingTime || "22:00",
            shopkeeperId: userId,
        }
    })
    return shop

}