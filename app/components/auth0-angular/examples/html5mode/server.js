var http = require('http');
var express = require('express');
var app = express();


app.configure(function () {

 // Request body parsing middleware should be above methodOverride
  app.use(express.bodyParser());
  app.use(express.urlencoded());
  app.use(express.json());

  app.use('/public', express.static(__dirname + '/public'));

  app.use(app.router);

});

app.get('/*', function(req, res) {
  res.sendfile(__dirname + '/public/index.html')
});

var port = process.env.PORT || 3000;

http.createServer(app).listen(port, function (err) {
  console.log('listening in http://localhost:' + port);
});
