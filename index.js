var express = require('express');
var pg = require('pg');
var cool = require('cool-ascii-faces');

var app = express();

pg.defaults.ssl = true;
app.set('port', (process.env.PORT || 5000));

app.get('/cool', function (request, response) {
  response.send(cool());
});

app.get('/update-heroes', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function (err, client) {
    if (err) throw err;
    console.log('Connected to Postgres! Updating Heroes.. ');

    
    // client
    //   .query('SELECT table_schema,table_name FROM information_schema.tables;')
    //   .on('row', function (row) {
    //     console.log(JSON.stringify(row));
    //   });
  });
});

app.get('/update-items', function (request, response) {

});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
