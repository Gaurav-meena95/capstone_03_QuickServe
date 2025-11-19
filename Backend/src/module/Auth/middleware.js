const jwt = require('jsonwebtoken')
const sec_key = process.env.sec_key
const verifymiddleware = (req, res, next) => {
    try {
        const Authheader = req.headers.authorization
        const refreshToken = req.headers['x-refresh-token']
        const [prefix, token] = Authheader.split(' ')
        if (prefix != 'JWT') {
            return res.status(403).json({ message: "Invalid Token" })
        }
        if (!token) {
            return res.status(403).json({ message: 'token Absent' })
        }
        jwt.verify(token, sec_key, (err, decode) => {
            if (err && err.name==="TokenExpiredError") {
                jwt.verify(refreshToken, sec_key, (err, decode) => {
                    if (err) {
                        return res.status(402).json({ msg: 'Invalid Token' })
                    }
                    const { accessToken, refreshToken } = generateNewToken(decode);
                    res.set('x-access-token', accessToken)
                    res.set('x-refresh-token', refreshToken)
                    next()
                })
            } else if (err) {
                return res.status(403).json({ message: 'token Absent' })
            }
            next()

        })
    } catch (error) {
        console.log(error)
    }


}

const generateNewToken = (decode) => {
    console.log(decode, "decode")
    const accessToken = jwt.sign(
        { id: decode.id, email: decode.email, role: decode.role },
        sec_key,
        { expiresIn: '1Sec' }
    )
    const refreshToken = jwt.sign(
        { id: decode.id, email: decode.email, role: decode.role },
        sec_key,
        { expiresIn: '1HR' }
    )
    return { accessToken, refreshToken }
}
module.exports = { verifymiddleware }