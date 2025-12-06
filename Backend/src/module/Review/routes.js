const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { verifymiddleware } = require('../Auth/middleware');

// Customer routes
router.post('/', verifymiddleware, controller.createReview);
router.get('/order/:orderId/can-review', verifymiddleware, controller.canReviewOrder);
router.get('/order/:orderId', verifymiddleware, controller.getUserOrderReview);

// Public routes
router.get('/shop/:shopId', controller.getShopReviews);

// Shopkeeper routes
router.get('/my-shop', verifymiddleware, controller.getMyShopReviews);

module.exports = router;
