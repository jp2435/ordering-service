const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const SecretEnv = process.env.SECRET
const SecretHash = process.env.SECRET_HASH

module.exports = (req,res,next) => {
    const authHeader = req.headers.authorization
    const developHeader = req.headers.develop
    if(!authHeader){
        return res.status(401).send({
            error: 'No token provided'
        });
    };
    
    const parts = authHeader.split(' ');
    if(!parts.length === 2){
        return res.status(401).send({
            error: 'Token error'
        });
    };
    const [ scheme,token ] = parts;
    if(!/^Bearer$/i.test(scheme)){
        return res.status(401).send({
            error: 'Token malformatted'
        });
    };

    if(developHeader){
        let hashedToken = req.headers.hashedtoken
        const signature = crypto.createHmac('sha256', SecretHash)
                            .update(Buffer.from(token), 'utf-8')
                            .digest('hex')
        if(signature != hashedToken){   
            return res.status(423).send({
                error: 'Token modified without authorization',
                warring: 'Account temporarily blocked'
            })
        }
    }
    jwt.verify(token, SecretEnv, (err,decoded) => {
        if(err) return res.status(401).send({error: 'Token invalid'});

        req.userId = decoded.id;
        req.userRole = decoded.role;
        return next();
    });
};