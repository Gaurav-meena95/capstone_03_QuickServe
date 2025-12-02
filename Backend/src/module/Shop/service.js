const prisma = require('../../config/prismaClient')

function slugify(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
async function generateUniqueSlug(baseName) {
    let base = slugify(baseName);
    if (!base) base = "shop";

    let slug = base;
    let counter = 1;
    while (true) {
        const existing = await prisma.shop.findUnique({ where: { slug } });
        if (!existing) return slug;
        slug = `${base}-${counter++}`;
    }
}

exports.createShopForUser = async (userId, payload) => {
    if (!payload.name || !payload.category || !payload.address || !payload.city || !payload.pincode) {
        throw new Error("Missing required fields: name, category, address, city, pincode");
    }
    const exsiting = await prisma.shop.findUnique({ where: { shopkeeperId: userId } });
    if (exsiting) {
        throw new Error('Shop already exists for this shopkeeper')
    }
    const slug = await generateUniqueSlug(payload.name);
    const shop = await prisma.shop.create({
        data: {
            name: payload.name,
            description: payload.description,
            slug,
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

exports.getShopbyUserId = async (userId) => {
    const shop = await prisma.shop.findUnique({
        where: {
            shopkeeperId: userId,
            // include: {
            //     menuItems: true,
            //     categories: true,
            // }
        }
    })
    return shop

}

exports.updateShopByUser = async (userId, payload) => {
    if (payload.name) {
        payload.slug = await generateUniqueSlug(payload.name);
    }
    const updated = await prisma.shop.update({
        where: { shopkeeperId: userId },
        data:payload
    })
    return updated
}