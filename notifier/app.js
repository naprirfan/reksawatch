'use strict';

// Main starting point of the application
const express = require('express');
const app = express();
const config = require('./config');
const router = require('./router');
const morgan = require('morgan');

// App Setup
app.use(morgan('combined'));
router(app);

// Fire up server
var server = app.listen(config.PORT || 9091, function() {
  console.log('listening to port', config.PORT || 9091);
});
