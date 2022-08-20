const mysql = require('../mysql')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { ErrorException } = require('../functions/ErrorException')
const AcessCodeEnv = process.env.ACESSCODE

exports.createUser = async(req,res,next) => {
    try{
        const { username, password } = req.body
        const AcessCode = req.headers.acesscode
        if(AcessCode != AcessCodeEnv){
            throw new ErrorException('Não está autorizado a criar uma conta',401)
        }

        const passEncrypt = await bcrypt.hash(password,10)

        const query = 'insert into users(name_usr,pass_usr) values (?,?)'
        const results = await mysql.execute(query, [username,passEncrypt])
        
        return res.status(200).send({ message: results})
    }catch(err){
        return res.status(err.status || 500).send({ message: err })
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
            const token = jwt.sign({id: results[0].id_usr, role: results[0].role},process.env.SECRET,{
                expiresIn: '20h'
            })
            return res.status(200).send({ message: 'Autenticação realizado com sucesso', token: token})
        }else{
            throw new ErrorException('Falha na autenticação', 404)
        }
    }catch(err){
        return res.status(err.status || 500).send({ message: err })
    }
}