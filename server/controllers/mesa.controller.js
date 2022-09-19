const mysql = require('../mysql')
const { ErrorException } = require('../functions/ErrorException')


exports.getMesas = async(req,res,next) => {
    try{
        const query = 'select * from mesas'
        const results = await mysql.execute(query)

        return res.send(results)
    }catch(err){
        return res.status(500).send({ message: err })
    }
}
exports.createMesa = async(req,res,next) => {
    try{
        const { nameMesa } = req.body
        if(nameMesa.length < 1){
            throw new ErrorException('Atributo {nameMesa} não declarado',400)
        }

        const query = 'insert into mesas(name_mesa) values (?)'
        const results = await mysql.execute(query, [nameMesa])

        return res.send(results)
    }catch(err){
        return res.status(500).send({ message: err })
    }
}
exports.editMesa =  async(req,res,next) => {
    try{
        const { idMesa } = req.params
        const { nameMesa } = req.body
        if(nameMesa.length < 1){
            throw new ErrorException('Atributo {nameMesa} não atribuido',400)
        }
        
        const query = 'update mesas set name_mesa=? where id_mesa=?'
        const results = await mysql.execute(query,[nameMesa,idMesa])

        return res.send({ message: 'Alteração realizada com sucesso'})
    }catch(err){
        return res.status(err.status || 500).send({ message: err })
    }
}
exports.deleteMesa = async(req,res,next) => {
    try{
        const { idMesa } = req.params

        const query = 'delete from mesas where id_mesa = ?'
        const results = await mysql.execute(query, [idMesa])

        return res.send({ message: 'Mesa eliminada com sucesso'})
    }catch(err){
        return res.status(err.status || 500).send({ message: err })
    }
}