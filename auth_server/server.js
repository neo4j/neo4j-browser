var express = require('express')
var https = require('https')
var fs = require('fs')
const path = require('path')
var app = express()

app.use(express.static(path.join(__dirname, './public')))

var options = {
  key: fs.readFileSync(path.join(__dirname, './keys/private.key')),
  cert: fs.readFileSync(path.join(__dirname, './keys/certificate.pem'))
}
var secureServer = https.createServer(options, app).listen(9001, function () {
  var host = secureServer.address().address
  var port = secureServer.address().port

  console.log('Sync server listening at https://%s:%s', host, port)
})
