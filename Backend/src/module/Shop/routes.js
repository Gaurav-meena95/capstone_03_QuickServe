const express = require('express')
const shopRouter = express.Router()
const {verifymiddleware} = require('../Auth/middleware')
const controller = require('./controller')

shopRouter.post('/',verifymiddleware ,controller.createShop)
shopRouter.get('/me',verifymiddleware,controller.getMyShop)
shopRouter.put('/me',verifymiddleware,controller.updateMyShop)

module.exports = shopRouter