const mysql = require('mysql')

let pool = mysql.createPool({
    'user': process.env.USER_DB,
    'password': process.env.PASS_DB,
    'database': process.env.DB,
    'host': process.env.HOST_DB,
    'port': process.env.PORT_DB
})

exports.execute = (query, params = []) => {
    return new Promise((resolve,reject) => {
        pool.query(query, params, (error,result,fields)=>{
            if(error){
                reject(error)
            }else{
                resolve(result)
            }
        })
    })
}
exports.pool = pool