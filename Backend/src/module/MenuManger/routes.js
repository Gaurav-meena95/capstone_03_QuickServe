const express = require('express')
const menuRouter = express.Router()
const { verifymiddleware } = require('../Auth/middleware')
const controller = require('./controller')

// Get all menu items for shopkeeper's shop
menuRouter.get('/', verifymiddleware, controller.getMyMenuItems)

// Create a new menu item
menuRouter.post('/', verifymiddleware, controller.createMenuItem)

// Update a menu item
menuRouter.patch('/:id', verifymiddleware, controller.updateMenuItem)

// Delete a menu item
menuRouter.delete('/:id', verifymiddleware, controller.deleteMenuItem)

// Toggle availability of a menu item
menuRouter.patch('/:id/toggle-availability', verifymiddleware, controller.toggleAvailability)

module.exports = menuRouter
