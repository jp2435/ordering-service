/**
 * @param{string} message - Error message
 * @param{number} status - HTTP Status Code
*/
function ErrorException(message,status){
    this.message = message,
    this.status = status
}

module.exports = {
    ErrorException
}