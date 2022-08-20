const express = require('express')
const router = express.Router()
const produtoController = require('../controllers/produto-controller')
const authMiddleware = require('../middleware/auth')
const { authRole } = require('../middleware/role')

router.use(authMiddleware)

router.get('/', produtoController.getProdutos)
router.post('/create', authRole,produtoController.createProduto)
router.put('/edit/:idProduto', authRole,produtoController.editProduto)
router.delete('/delete/:idProduto', authRole,produtoController.deleteProduto)

module.exports = app => app.use('/produto', router)