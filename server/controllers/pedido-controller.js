const mysql = require('../mysql')
const { ErrorException } = require('../functions/ErrorException')

exports.getPedidosAdmin = async(req,res,next) => {
    try{
        const query = 'select * from pedidos'
        const results = await mysql.execute(query)

        return res.send(results)
    }catch(err){
        return res.status(err.status || 500).send({ message: err.message || err})
    }
}
exports.getPedido = async(req,res,next) => {
    try{
        const { idPedido } = req.params
        const queryPedido = 'select * from pedidos where id_pedido=?'
        const resultsPedido = await mysql.execute(queryPedido,idPedido)

        if(!(req.userRole == 1 || req.userId == resultsPedido[0].id_usr)){
            throw new ErrorException('Não tem permissão para aceder este pedido', 403)
        }

        const idMesa = resultsPedido[0].id_mesa
        const queryProdutos = 'select * from produtos_in_pedidos where id_pedido=?'
        const resultsProdutos = await mysql.execute(queryProdutos, [idPedido])

        const reponse = {
            pedido: {
                id: Number(idPedido),
                idUsr: resultsPedido[0].id_usr,
                idMesa: idMesa,
                produtos: resultsProdutos.map(produto => {
                    return {
                        idProduto: produto.id_produto,
                        quantidade: produto.quantidade
                    }
                })
            }
        }
        return res.send(reponse)
    }catch(err){
        return res.status(err.status || 500).send({ message: err.message || err})
    }
}
exports.getPedidosUser = async(req,res,next) => {
    try{
        const { idUser } = req.params
        if(!(req.userRole == 1 || req.userId == idUser)){
            throw new ErrorException('Não tem permissão para aceder este pedido', 403)
        }
        const query = 'select * from pedidos where id_usr=?'
        const results = await mysql.execute(query, [idUser])

        const response = {
            pedidos: results.map(pedido => {
                return {
                    idPedido: pedido.id_pedido,
                    idMesa: pedido.id_mesa
                }
            })
        }
        return res.send(response)
    }catch(err){
        return res.status(err.status || 500).send({ message: err.message || err})
    }
}
exports.createPedido = async(req,res,next) => {
    try{
        const { idMesa, produtos } = req.body
        const idUsr = req.userId
        if(idMesa.length<1){
            throw new ErrorException('Atributo {idMesa} não declarado', 400)
        }
        if(produtos.length<1){
            throw new ErrorException('Atributo {produtos} não declarado', 400)
        }

        const queryPedido = 'insert into pedidos(id_usr,id_mesa) values (?,?)'
        const resultsPedido = await mysql.execute(queryPedido, [idUsr,idMesa])

        const idPedido = resultsPedido.insertId

        let queryProdutos = 'insert into produtos_in_pedidos(id_pedido,id_produto,quantidade) values '
        let queryArray = []
        produtos.map((produto,index) => {
            if(index==produtos.length-1){
                queryProdutos += '(?,?,?)'
            }else{
                queryProdutos += '(?,?,?),'
            }
            queryArray = [...queryArray, idPedido,produto.id,produto.quantidade]
        })
        
        const resultsProdutos = await mysql.execute(queryProdutos,queryArray)
        const response = {
            message: 'Pedido criado com sucesso',
            pedido: {
                id: idPedido,
                userId: idUsr,
                produtos: produtos.map(produto => {
                    return {
                        idProduto: produto.id,
                        quantidade: produto.quantidade
                    }
                })
            }
        }
        return res.send(response)    
    }catch(err){
        return res.status(err.status || 500).send({ message: err.message || err })
    }
}
exports.editPedido = async(req,res,next) => {
    try{
        const { idPedido } = req.params
        const { produtos } = req.body
        if (produtos.length < 1) {
            throw new ErrorException('Atributo {produtos} não declarado', 400)
        }
        const queryPedido = 'select * from pedidos where id_pedido=?'
        const resultsPedido = await mysql.execute(queryPedido,idPedido)

        if(!(req.userRole == 1 || req.userId == resultsPedido[0].id_usr)){
            throw new ErrorException('Não tem permissão para aceder este pedido', 403)
        }
    
        const queryProdutos = 'select * from produtos_in_pedidos where id_pedido=?'
        const resultProdutos = await mysql.execute(queryProdutos, [idPedido])

        let produtosNovos = []
        let produtosAnteriores = []       
        for(let i = 0;i<resultProdutos.length;i++){
            const res = produtos.filter(prod => prod.id == resultProdutos[i].id_produto)
            if(res[0].quantidade != resultProdutos[i].quantidade){
                res[0].changeQ = true
            }
            produtosAnteriores = res.length<1 ? [...produtosAnteriores] : [...produtosAnteriores,res[0]]            
        }
        
        let queryOld = ''
        let queryArrayOld = []
        produtosAnteriores.map(async(produto,index) => {
            if(produto.changeQ){
                queryOld = 'update produtos_in_pedidos set quantidade=? where id_pedido=? and id_produto=?;'
                queryArrayOld= [produto.quantidade,idPedido,produto.id]
                await mysql.execute(queryOld,queryArrayOld)
            }
        })     
        // Fazer a filtraçãp dos produtos novos dos anteriores
        for(let i = 0;i<produtos.length;i++){
            let info = []
            for(let j=0;j<produtosAnteriores.length;j++){
                if(produtos[i].id == produtosAnteriores[j].id){
                    info = [...info,1]
                }else{
                    info = [...info,0]
                }
            }
            if(info.indexOf(1)!=-1){
                produtos[i].old=true
            }
        }

        produtosNovos = produtos.filter(prod => !prod.old)
        let queryNew = 'insert into produtos_in_pedidos(id_pedido,id_produto,quantidade) values '
        let queryArrayNew = []
        if(produtosNovos.length>0){
            produtosNovos.map((prod,index) => {
                if(index==produtosNovos.length-1){
                    queryNew += '(?,?,?)'
                }else{
                    queryNew += '(?,?,?),'
                }
                queryArrayNew = [...queryArrayNew,idPedido,prod.id,prod.quantidade]
            })
            await mysql.execute(queryNew,queryArrayNew)
        }

        const queryUpdate = 'update pedidos set updatedAt = current_timestamp where id_pedido=?'
        await mysql.execute(queryUpdate, [idPedido])

        const response = {
            message: 'Pedido alterado com sucesso',
            pedido: {
                id: Number(idPedido),
                userId: resultsPedido[0].id_usr,
                produtos: produtos.map(produto => {
                    return {
                        idProduto: produto.id,
                        quantidade: produto.quantidade
                    }
                })
            }
        }
        return res.send(response)
    }catch(err){
        return res.status(err.status || 500).send({ message: err.message || err })
    }
}
exports.deleteProdutoInPedido = async(req,res,next) => {
    try{
        const { idPedido } = req.params
        const { idProduto } = req.query

        if(idProduto.length < 1){
            throw new ErrorException('Atributo {idProduto} não declarado', 400)
        }
        const query = 'delete from produtos_in_pedidos where id_pedido=? and id_produto=?'
        const queryArray = [idPedido,idProduto]
        await mysql.execute(query,queryArray)

        const queryUpdate = 'update pedidos set updatedAt = current_timestamp where id_pedido=?'
        await mysql.execute(queryUpdate, [idPedido])
        
        const response = {
            message: 'Produto retirado com sucesso'
        }
        return res.send(response)
    }catch(err){
        return res.status(err.status || 500).send({ message: err.message || err})
    }
}