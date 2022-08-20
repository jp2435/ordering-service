const express = require('express')
const router = express.Router()
const mesaController = require('../controllers/mesa-controller')
const authMiddleware = require('../middleware/auth')
const {authRole} = require('../middleware/role')

router.use(authMiddleware)

router.post('/create', authRole,mesaController.createMesa)
router.get('/', mesaController.getMesas)
router.delete('/delete/:idMesa', authRole ,mesaController.deleteMesa)
router.put('/edit/:idMesa',authRole, mesaController.editMesa)

module.exports = app => app.use('/mesa', router)