'use strict';

var logger = require('winston');

//Customising logger
logger.transports.Console.timestamp = true;
logger.level = 'info';

module.exports = logger;
