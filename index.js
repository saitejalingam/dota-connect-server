var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var util = require('util');
var SteamStrategy = require('passport-steam').Strategy;
var request = require('request');

var app = express();
var router = express.Router();

app.set('port', (process.env.PORT || 5000));
app.use(passport.initialize());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(new SteamStrategy({
  returnURL: 'https://dota-connect-server.herokuapp.com/api/login/success',
  realm: 'https://dota-connect-server.herokuapp.com',
  apiKey: process.env.STEAM_API_KEY
},
  function (identifier, profile, done) {
    process.nextTick(function () {
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));

router.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

router.get('/health', function (request, response) {
  response.send({ msg: 'dota-connect-server is running.' });
});

router.get('/login',
  passport.authenticate('steam'));

router.get('/login/success',
  passport.authenticate('steam', { failureRedirect: '/login' }),
  function (req, res) {
    res.send();
  });

app.use('/api', router);
app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
