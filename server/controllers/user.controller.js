const mysql = require('../mysql')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { ErrorException } = require('../functions/ErrorException')
const { on } = require('stream')

const AcessCodeEnv = process.env.ACESSCODE
const Secret = process.env.SECRET
const SecretHash = process.env.SECRET_HASH


const hashedTokenGenerate = async(token) => {
    const response = crypto.createHmac('sha256', SecretHash)
    .update(Buffer.from(token), 'utf-8')
    .digest('hex')
    return response
}

exports.createUser = async(req,res,next) => {
    try{
        const { username, password } = req.body
        const AcessCode = req.headers.acesscode

        if(username.length < 1){
            const error = new Error('Campo usuário vazio')
            error.status = 400
            throw error
        }
        if(password.length < 10){
            const error = new Error('Palavra passe curta')
            error.status = 400
            throw error
        }
        if(AcessCode != AcessCodeEnv){
            throw new ErrorException('Não está autorizado a criar uma conta',401)
        }

        const passEncrypt = await bcrypt.hash(password,10)

        const query = 'insert into users(name_usr,pass_usr) values (?,?)'
        const results = await mysql.execute(query, [username,passEncrypt])
        
        return res.status(201).send({ message: results})
    }catch(err){
        console.log(err)
        return res.status(err.status || 500).send({ message: err.message || err })
    }
}

exports.loginUser = async(req,res,next) => {
    try{
        const { username, password } = req.body
        const query = 'select * from users where name_usr=?'
        const results = await mysql.execute(query, [username])

        if(results.length < 1){
            throw new ErrorException('Falha na autenticação', 404)
        }
        
        if(await bcrypt.compareSync(password,results[0].pass_usr)){
            const token = jwt.sign({id: results[0].id_usr, role: results[0].role}, Secret,{
                expiresIn: '20h'
            })
            
            const hashedToken = await hashedTokenGenerate(token)

            const response = {
                message: 'Autenticação realizado com sucesso',
                token,
                request: {
                    type: 'POST',
                    url: req.originalUrl
                }
            }
            
            res.set('Hashed-token', hashedToken)
            console.log(hashedToken)
            return res.status(200).send(response)
        }else{
            throw new ErrorException('Falha na autenticação', 404)
        }
    }catch(err){
        return res.status(err.status || 500).send({ message: err.message || err })
    }
}