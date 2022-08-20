function authRole(req,res,next){
    if(req.userRole != 1){
        return res.status(401).send({ message: 'Not allowed' })
    }
    next()
}

module.exports = {
    authRole
}