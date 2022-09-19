const express = require('express')
const router = express.Router()
const pedidoController = require('../controllers/pedido.ontroller')
const authMiddleware = require('../middleware/auth')
const { authRole } = require('../middleware/role')

router.use(authMiddleware)

router.get('/all', authRole, pedidoController.getPedidosAdmin)
router.get('/:idPedido', pedidoController.getPedido)
router.get('/user/:idUser', pedidoController.getPedidosUser)
router.post('/create', pedidoController.createPedido)
router.put('/edit/:idPedido', pedidoController.editPedido)
router.put('/edit/:idPedido/delete', pedidoController.deleteProdutoInPedido)

module.exports = app => app.use('/pedido', router)