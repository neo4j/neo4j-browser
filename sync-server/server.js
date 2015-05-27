var express = require('express');
var https = require('https');
var fs = require('fs');
var app = express();

app.use(express.static('sync-server/public'));

var options = {
  key: fs.readFileSync('sync-server/keys/private.key'),
  cert: fs.readFileSync('sync-server/keys/certificate.pem')
};
var secureServer = https.createServer(options, app).listen(9001, function () {
  var host = secureServer.address().address;
  var port = secureServer.address().port;

  console.log('Sync server listening at https://%s:%s', host, port);
});
