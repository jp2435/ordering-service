const express = require('express')
const router = express.Router()
const UserController = require('../controllers/user.controller')
const { networkInterfaces } = require('os');

router.post('/', UserController.createUser)
router.post('/login', UserController.loginUser)
router.get('/someroute', (req,res,next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(ip); // ip address of the user
    console.log('//////')
    const nets = networkInterfaces();
    const results = Object.create(null); // Or just '{}', an empty object
    
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    console.log(results)
    next()
  });

module.exports = app => app.use('/auth', router)