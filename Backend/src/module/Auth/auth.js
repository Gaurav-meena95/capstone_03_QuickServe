const express = require('express')
const router  = express.Router()
const {signup, login} = require('./controle')
const { verifymiddleware } = require('./middleware')

router.post('/signup',signup) 
router.post('/login',login)
router.get('/verify', verifymiddleware, (req, res) => {
    res.status(200).json({ message: 'Token is valid', user: req.user })
})

module.exports = router

