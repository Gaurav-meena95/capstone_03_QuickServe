const express = require('express')
const shopRouter = express.Router()
const auth = require('../Auth/middleware')
const controller = require('./controller')

shopRouter.post('/' ,controller.createShop)