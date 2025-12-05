const express = require('express')
const router = express.Router()
const {verifymiddleware} = require('../Auth/middleware')
const {getProfile, updateProfile, getUserStats} = require('./controller')

// Get user profile
router.get('/', verifymiddleware, getProfile)

// Update user profile
router.put('/', verifymiddleware, updateProfile)

// Get user statistics
router.get('/stats', verifymiddleware, getUserStats)

module.exports = router
