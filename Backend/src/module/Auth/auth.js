const express = require('express')
const router  = express.Router()
const {signup, login,check} = require('./controle')
const { verifymiddleware } = require('./middleware')

router.post('/signup',signup) 
router.post('/login',login)
router.get('/hy', verifymiddleware, check)

module.exports = router

