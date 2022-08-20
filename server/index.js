require('dotenv').config()
const express = require('express')
const app = express()
const { createServer } = require('http')
const port = 8080

const httpServer = createServer(app)

app.use(express.json())

require('./routes/index')(app)

app.use((req,res,next) => {
    const error = new Error('Não encontrado')
    error.status = 404
    next(error)
})

app.use((error,req,res,next) => {
    res.status(error.status || 500)
    return res.send({
        error: {
            message: error.message
        }
    })
})

httpServer.listen(port,() => {
    console.log(`Server ligado, porta:${port}`)
})