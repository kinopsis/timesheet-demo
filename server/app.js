"use strict";

var path = require('path');
var config = require('./config');
var models = require('./models');

var isDevelopmentEnvironment = process.env.NODE_ENV === 'development';

// express
var express = require('express');
var app = express();

// mongoose
var mongoose = require('mongoose');
mongoose.connect(config.mongoUrl);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// favicon
var favicon = require('serve-favicon');
app.use(favicon(path.join(__dirname, '../dist/assets/favicon.ico')));

// logger
var logger = require('morgan');
app.use(logger('dev'));

// static content
app.use(express.static(path.join(__dirname, '../dist')));

// body parser
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// passport config
var passport = require('passport');
var PassportJwtStrategy = require('passport-jwt').Strategy;
passport.use(models.account.createStrategy());
passport.use(new PassportJwtStrategy(config.jwt, function (payload, done) {
  models.account.findOne({_id: payload.sub}, function (err, user) {
    if (err) {
      return done(err, false);
    }
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  });
}));
app.use(passport.initialize());

// routes
app.use('/', require('./routes'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (isDevelopmentEnvironment) {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      user: req.user,
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    user: req.user,
    message: err.message,
    error: {}
  });
});

module.exports = app;