var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');
var cool = require('cool-ascii-faces');

var app = express();
var router = express.Router();

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

pg.defaults.ssl = true;
pg.connect(process.env.DATABASE_URL, function (err, client) {
  if (err) throw err;
  console.log('Connected to Postgres!');


  // client
  //   .query('SELECT table_schema,table_name FROM information_schema.tables;')
  //   .on('row', function (row) {
  //     console.log(JSON.stringify(row));
  //   });
});

router.get('/cool', function (request, response) {
  response.send(cool());
});

router.get('/update-heroes', function (request, response) {

});

router.get('/update-items', function (request, response) {

});

app.use('/api', router);
app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
