const express = require('express')
const router  = express.Router()
const {signup} = require('./controle')

router.post('/signup',signup) 

module.exports = router

