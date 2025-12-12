const prisma = require('../../config/prismaClient');

// Create a review for a shop
exports.createReview = async (userId, reviewData) => {
  console.log('🔍 Service received reviewData:', reviewData);
  const { shopId, orderId, rating, comment } = reviewData;

  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  // If orderId is provided, verify the order exists and belongs to the user
  if (orderId) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        customerId: userId,
        shopId: shopId,
        status: 'completed', // Only allow reviews for completed orders
      },
    });

    if (!order) {
      throw new Error('Order not found or not completed');
    }

    // Check if user already reviewed this order
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        orderId,
      },
    });

    if (existingReview) {
      throw new Error('You have already reviewed this order');
    }
  }

  // Create the review - explicitly use lowercase status
  const createData = {
    userId,
    shopId,
    orderId: orderId || null,
    rating,
    comment: comment || null,
    status: 'pending', // Explicitly set to lowercase pending
  };
  
  console.log('🔍 About to create review with data:', createData);
  console.log('🔍 Data type check:', typeof createData.status, createData.status);
  console.log('🔍 Full data object:', JSON.stringify(createData, null, 2));
  
  const review = await prisma.review.create({
    data: createData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  // Update shop rating
  await updateShopRating(shopId);

  return review;
};

// Update shop's average rating
async function updateShopRating(shopId) {
  const reviews = await prisma.review.findMany({
    where: {
      shopId,
      status: 'approved',
    },
    select: {
      rating: true,
    },
  });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    : 0;

  await prisma.shop.update({
    where: { id: shopId },
    data: {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalRatings: totalReviews,
    },
  });
}

// Get reviews for a shop
exports.getShopReviews = async (shopId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: {
        shopId,
        status: 'approved',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: parseInt(limit),
    }),
    prisma.review.count({
      where: {
        shopId,
        status: 'approved',
      },
    }),
  ]);

  return {
    reviews,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get user's review for a specific order
exports.getUserOrderReview = async (userId, orderId) => {
  const review = await prisma.review.findFirst({
    where: {
      userId,
      orderId,
    },
    include: {
      shop: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return review;
};

// Check if user can review an order
exports.canReviewOrder = async (userId, orderId) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      customerId: userId,
      status: 'completed',
    },
  });

  if (!order) {
    return { canReview: false, reason: 'Order not found or not completed' };
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      orderId,
    },
  });

  if (existingReview) {
    return { canReview: false, reason: 'Already reviewed', review: existingReview };
  }

  return { canReview: true, order };
};

// Get reviews for shopkeeper's shop
exports.getMyShopReviews = async (userId, page = 1, limit = 10) => {
  const shop = await prisma.shop.findUnique({
    where: { shopkeeperId: userId },
    select: { id: true },
  });

  if (!shop) {
    throw new Error('Shop not found');
  }

  return exports.getShopReviews(shop.id, page, limit);
};
