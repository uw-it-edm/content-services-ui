/*
 * This karma configuration file is designed to facilitate a TDD workflow for developers.
 * The goal is to be able to run/debug focused tests from Chrome or from an external tool.
 */

// import settings from default config file
var properties = null;
var originalConfigFn = require('./karma.conf.js');
originalConfigFn({ set: function (arg) { properties = arg; } });

// remove the parallel framework, this makes running focused tests simpler and faster.
let parallelIndex = properties.frameworks.indexOf('parallel');
if (parallelIndex >= 0) {
  properties.frameworks.splice(parallelIndex, 1)
}

// Adds a custom launcher that can open chrome with a specified port for remote debugging.
properties.customLaunchers = {
  ChromeDebugging: {
    base: 'Chrome',
    flags: ['--remote-debugging-port=9333']
  }
};

// Export the updated settings
module.exports = function (config) {
  config.set(properties);
};
