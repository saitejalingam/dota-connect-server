var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var util = require('util');
var session = require('express-session');
var SteamStrategy = require('passport-steam').Strategy;
var request = require('request');
var pg = require('pg');

var app = express();
var router = express.Router();

app.set('port', (process.env.PORT || 5000));
app.use(session({
  secret: 'your secret',
  name: 'dota-connect-server',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

passport.use(new SteamStrategy({
  returnURL: 'http://localhost:5000/api/user',
  realm: 'http://localhost:5000/api/user',
  apiKey: process.env.STEAM_API_KEY
},
  function (identifier, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's Steam profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Steam account with a user record in your database,
      // and return that user instead.
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));

// pg.defaults.ssl = true;
pg.connect(process.env.DATABASE_URL, function (err, client) {
  if (err) throw err;
  console.log('Connected to Postgres!');


  // client
  //   .query('SELECT table_schema,table_name FROM information_schema.tables;')
  //   .on('row', function (row) {
  //     console.log(JSON.stringify(row));
  //   });
});

router.use(function (req, res, next) {
  console.log('Authenticating...');
  next();
});

router.get('/health', function (request, response) {
  response.send({ msg: 'dota-connect-server is running.' });
});

router.get('/login',
  passport.authenticate('steam', { failureRedirect: '/' }),
  function (req, res) {
    console.log(res);
    res.redirect('/health');
  });

router.get('/user', function (request, response) {
  var user_id = request
    .query['openid.claimed_id']
    .split('/')
    .splice(-1, 1);

  console.log(user_id);
  var url = 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002'
  var params = {
    key: process.env.STEAM_API_KEY,
    steamids: user_id
  }

  request({ url: url, qs: params }, function (err, res, body) {
    if (err) { console.log(err); return; }
    console.log("Get response: " + response.statusCode);
    console.log(response);
    response.send(res);
  });
});

app.use('/api', router);
app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
