/* eslint global-require: "off" */

'use strict';

const { appEnv } = require('garage-utils');

if (appEnv.isProd()) {
  require('./dist');
} else {
  require('nodemon')({ script: 'dev.js' });
}
