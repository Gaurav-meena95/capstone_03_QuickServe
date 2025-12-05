const express = require('express');
const customerRouter = express.Router();
const { verifymiddleware } = require('../Auth/middleware');
const controller = require('./controller');

// Shop routes
customerRouter.get('/shops', verifymiddleware, controller.getAllShops);
customerRouter.get('/shops/:slug', controller.getShopMenu); // Public route for QR code scanning

// Order routes
customerRouter.post('/orders', verifymiddleware, controller.createOrder);
customerRouter.get('/orders', verifymiddleware, controller.getMyOrders);
customerRouter.get('/orders/:id', verifymiddleware, controller.getOrderById);
customerRouter.get('/orders/track/:token', controller.getOrderByToken); // Public route

// Favorites routes
customerRouter.post('/favorites', verifymiddleware, controller.addToFavorites);
customerRouter.delete('/favorites/:shopId', verifymiddleware, controller.removeFromFavorites);
customerRouter.get('/favorites', verifymiddleware, controller.getFavorites);

module.exports = customerRouter;
