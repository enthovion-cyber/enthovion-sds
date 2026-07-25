const morgan = require('morgan');
const env = require('../config/env');

const requestLogger = morgan(
  env.isDev
    ? ':method :url :status :response-time ms - :res[content-length]'
    : ':remote-addr :method :url :status :response-time ms'
);

module.exports = requestLogger;
