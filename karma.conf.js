// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html

module.exports = function (config) {
  config.set({
               basePath: '',
               frameworks: ['parallel', 'jasmine', '@angular-devkit/build-angular'],
               plugins: [
                 require('karma-parallel'),
                 require('karma-jasmine'),
                 require('karma-chrome-launcher'),
                 require('karma-jasmine-html-reporter'),
                 require('karma-coverage-istanbul-reporter'),
                 require('@angular-devkit/build-angular/plugins/karma'),
                 require('karma-spec-reporter')
               ],
               files: [
                 {pattern: './node_modules/@angular/material/prebuilt-themes/indigo-pink.css'}
               ],
               client: {
                 clearContext: false, // leave Jasmine Spec Runner output visible in browser
                 captureConsole: false
               },
               coverageIstanbulReporter: {
                 dir: require('path').join(__dirname, 'coverage'), reports: ['html', 'lcovonly'],
                 fixWebpackSourcePaths: true
               },
               
               reporters: ['spec'],
               specReporter: {
                 maxLogLines: 5,             // limit number of lines logged per test
                 suppressErrorSummary: false, // do not print error summary
                 suppressFailed: false,      // do not print information about failed tests
                 suppressPassed: false,      // do not print information about passed tests
                 suppressSkipped: true,      // do not print information about skipped tests
                 showSpecTiming: false      // print the time elapsed for each spec
               },
               port: 9876,
               colors: true,
               logLevel: config.LOG_INFO,
               autoWatch: true,
               browsers: ['ChromeHeadless'],
               singleRun: false,
               browserNoActivityTimeout: 100000,     // default 10,000ms
               browserDisconnectTolerance: 5,        // default 0
               retryLimit: 5                         // default 2
             });
};
