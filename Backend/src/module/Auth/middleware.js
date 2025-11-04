
const authMiddleware = (req, res, next) => {
    const { name, email, password, role } = req.body
    if (role == "CUSTOMER"){
        next()
    }
}