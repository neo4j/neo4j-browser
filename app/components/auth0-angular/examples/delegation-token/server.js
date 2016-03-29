var express   = require('express');

var jwt       = require('express-jwt');
var cors      = require('cors');

var app             = express();
var secondaryApp    = express();

var SECRET    = 'A92LWsdBgH6legaUm8U3uyJ7n1bdEik7WvO8nQab9LlHTtnawpRx8d-HPqW0b2g-';
var AUDIENCE  = 'DyG9nCwIEofSy66QM3oo5xU6NFs3TmvT';

var authenticate = jwt({
  secret: new Buffer(SECRET, 'base64'),
  audience: AUDIENCE
});

app.use(express.logger());

app.use('/', express.static(__dirname + '/client/'));

app.use('/api', authenticate);

app.get('/api/protected', function (req, res) {
  res.send(200, 'This API Rocks!');
});

app.listen(3000);
console.log('Main application listening on port http://localhost:3000');

var SECONDARY_APP_SECRET    = 'DLQ5dWkNMwPlUWo2jqVkbG1PFyeMvV60HEJaW0FioeI4ZxGaAW73BiqRBZmRk29v';
var SECONDARY_APP_AUDIENCE  = 'vYPeq7LGf1utg2dbDlGKCwGKgy94lPH0'; // Another App

var authenticateSecondaryApp = jwt({
  secret: new Buffer(SECONDARY_APP_SECRET, 'base64'),
  audience: SECONDARY_APP_AUDIENCE
});

secondaryApp.use(cors());
secondaryApp.use(express.logger());

secondaryApp.use('/api', authenticateSecondaryApp);

secondaryApp.get('/api/protected', function (req, res) {
  res.send(200, 'This API Rocks!');
});

secondaryApp.listen(33000);
console.log('Secondary application listening on port http://localhost:33000');
