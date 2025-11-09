const jwt = require('jsonwebtoken')
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Access denied, no token provided" })
    }
    const token = authHeader.split(' ')[1]
    try {
        const decode = jwt.verify(token, process.env.sec_key)
        req.user = decode;
        next();


    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Invalid or expired token" });
    }
}
module.exports = { authMiddleware }