var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var util = require('util');
var session = require('express-session');
var SteamStrategy = require('passport-steam').Strategy;
var request = require('request');

var app = express();
var router = express.Router();

app.set('port', (process.env.PORT || 5000));
app.use(session({
  secret: process.env.APP_SECRET,
  name: 'dota-connect-server',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

passport.use(new SteamStrategy({
  returnURL: 'https://dota-connect-server.herokuapp.com/api/user',
  realm: 'https://dota-connect-server.herokuapp.com',
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

router.use(function (req, res, next) {
  console.log('Authenticating...');
  next();
});

router.get('/health', function (request, response) {
  response.send({ msg: 'dota-connect-server is running.' });
});

router.get('/login',
  passport.authenticate('steam', { failureRedirect: '/' })
);

router.get('/user', function (req, response) {
  console.log('Login successful...');
  console.log('Fetching user data...');
  var user_id = req
    .query['openid.claimed_id']
    .split('/')
    .splice(-1, 1)[0];

  var options = {
    url: 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002',
    qs: {
      key: process.env.STEAM_API_KEY,
      steamids: user_id
    }
  }

  request(options , function (err, res, body) {
    if (err) { console.log(err); return; }
    
    console.log('User data Fetch successful...');
    response.send(JSON.parse(res.body).response.players[0]);
  });
});

app.use('/api', router);
app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
