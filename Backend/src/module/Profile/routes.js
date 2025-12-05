const express = require('express')
const router = express.Router()
const {verifymiddleware} = require('../Auth/middleware')
const {getProfile, updateProfile} = require('./controller')

// Get user profile
router.get('/', verifymiddleware, getProfile)

// Update user profile
router.put('/', verifymiddleware, updateProfile)

module.exports = router
