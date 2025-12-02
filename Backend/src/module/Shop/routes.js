const express = require('express')
const shopRouter = express.Router()
const {verifymiddleware} = require('../Auth/middleware')
const controller = require('./controller')

shopRouter.post('/',verifymiddleware ,controller.createShop)

module.exports = shopRouter