const mysql = require('../mysql')
const { ErrorException } = require('../functions/ErrorException')

exports.getProdutos = async(req,res,next) => {
    try{
        const query = 'select * from produtos'
        const results = await mysql.execute(query)

        return res.send(results)
    }catch(err){
        return res.status(err.status || 500).send({ message: err.message || err })
    }
}
exports.createProduto = async(req,res,next) => {
    try{
        const { nameProduto, precoProduto } = req.body
        if(nameProduto.length<1){
            throw new ErrorException('Atributo {nameProduto} não declarado')
        }

        const query = 'insert into produtos(name_produto,preco) values (?,?)'
        const results = await mysql.execute(query,[
            nameProduto,
            precoProduto
        ])
        const response = {
            message: 'Produto criado com sucesso',
            produto: {
                id: results.insertId,
                name: nameProduto,
                preco: precoProduto
            }
        }
        return res.send(response)
    }catch(err){
        return res.status(err.status || 500).send({ message: err.message || err })
    }
}
exports.editProduto = async(req,res,next) => {
    try{
        const { idProduto } = req.params
        const { nameProduto, precoProduto} = req.body 

        const query = 'update produtos set name_produto=?,preco=? where id_produto=?'
        const results = await mysql.execute(query, [
            nameProduto,
            precoProduto,
            idProduto
        ])
        const response = {
            message: 'Produto alterado com sucesso',
            produto: {
                id: idProduto,
                name: nameProduto,
                preco: precoProduto
            }
        }
        return res.send(response)
    }catch(err){
        return res.status(err.status || 500).send({ message: err.message || err })
    }
}
exports.deleteProduto = async(req,res,next) => {
    try{
        const { idProduto } = req.params
        const query = 'delete from produtos where id_produto=?'
        const results = await mysql.execute(query,[idProduto])

        return res.send({ message: 'Produto eliminado com sucesso'})
    }catch(err){
        return res.status(err.status || 500).send({ message: err.message || err })
    }
}