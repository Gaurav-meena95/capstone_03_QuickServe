const express = require('express')
const shopRouter = express.Router()
const {verifymiddleware} = require('../Auth/middleware')
const controller = require('./controller')

shopRouter.post('/',verifymiddleware ,controller.createShop)
shopRouter.get('/me',verifymiddleware,controller.getMyShop)
shopRouter.patch('/me',verifymiddleware,controller.updateMyShop)
shopRouter.get('/dashboard',verifymiddleware,controller.getMyDashboard)
shopRouter.patch('/orders/:orderId/status',verifymiddleware,controller.updateOrderStatus)

module.exports = shopRouter