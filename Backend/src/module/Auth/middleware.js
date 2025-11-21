const jwt = require('jsonwebtoken')
const sec_key = process.env.sec_key

const verifymiddleware = (req, res, next) => {
    try {
        const Authheader = req.headers.authorization
        const refreshToken = req.headers['x-refresh-token']
        
        if (!Authheader) {
            return res.status(403).json({ message: 'Authorization header missing' })
        }
        
        const [prefix, token] = Authheader.split(' ')
        
        if (prefix != 'JWT') {
            return res.status(403).json({ message: "Invalid Token" })
        }
        
        if (!token) {
            return res.status(403).json({ message: 'token Absent' })
        }
        
        jwt.verify(token, sec_key, (err, decode) => {
            if (err && err.name === "TokenExpiredError") {
                if (!refreshToken) {
                    return res.status(401).json({ msg: 'Refresh token required' })
                }
                
                jwt.verify(refreshToken, sec_key, (err, decode) => {
                    if (err) {
                        return res.status(402).json({ msg: 'Invalid Refresh Token' })
                    }
                    
                    const { accessToken, refreshToken: newRefreshToken } = generateNewToken(decode);
                    res.set('x-access-token', accessToken)
                    res.set('x-refresh-token', newRefreshToken)
                    req.user = decode
                    next()
                })
            } else if (err) {
                return res.status(403).json({ message: 'Invalid token' })
            } else {
                req.user = decode
                next()
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

const generateNewToken = (decode) => {
    console.log(decode, "decode")
    const accessToken = jwt.sign(
        { id: decode.id, email: decode.email, role: decode.role },
        sec_key,
        { expiresIn: '1h' }
    )
    const refreshToken = jwt.sign(
        { id: decode.id, email: decode.email, role: decode.role },
        sec_key,
        { expiresIn: '7d' }
    )
    return { accessToken, refreshToken }
}

module.exports = { verifymiddleware }