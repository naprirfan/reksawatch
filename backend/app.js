'use strict';

// Main starting point of the application
const app = require('express')();
const config = require('./config');
const router = require('./router');
const morgan = require('morgan');
const redis = require('redis');
const redisClient = redis.createClient();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// DB Setup
// TODO: create password
mongoose.connect('mongodb://localhost:' + config.DB_NAME + '/' + config.DB_NAME);

// App Setup
redisClient.on('error', function (err) {
    console.log("Redis Error " + err);
});
app.set('redisClient', redisClient);
app.use(morgan('combined'));
app.use(bodyParser.json({ type: '*/*' }));
router(app);

var server = app.listen(config.PORT || 5050, function() {
  console.log('listening to port', config.PORT || 5050);
});
