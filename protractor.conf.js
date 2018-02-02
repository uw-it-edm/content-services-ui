// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
const JSONReporter = require('jasmine-bamboo-reporter');
const fs = require('fs');
const jasmineResultsFile = './e2e/jasmine-results.json';
const jasmineResultsLockFile = './e2e/jasmine-results.json.lock';

exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './e2e/**/*.e2e-spec.ts'
  ],
  multiCapabilities: [
    {
      'browserName': 'chrome'
    },
    {
      'browserName': 'firefox',
      'marionnette': true
    }
  ],
  seleniumAddress: 'http://edm-seleniumhub.clients.uw.edu:4444/wd/hub',
  baseUrl: process.env.baseUrl,
  framework: 'jasmine2',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function () {
    }
  },
  beforeLaunch: function () {
    //clean up any residual/leftover from a previous run. Ensure we have clean
    //files for both locking and merging.
    if (fs.existsSync(jasmineResultsLockFile)) {
      fs.unlinkSync(jasmineResultsLockFile);
    }
    if (fs.existsSync(jasmineResultsFile)) {
      fs.unlink(jasmineResultsFile);
    }
  },
  onPrepare() {
    require('ts-node').register({project: 'e2e/tsconfig.e2e.json'});

    jasmine.getEnv().addReporter(new SpecReporter({spec: {displayStacktrace: true}}));

    jasmine.getEnv().addReporter(new JSONReporter({
                                                    file: jasmineResultsFile,
                                                    beautify: true,
                                                    indentationLevel: 4 // used if beautify === true
                                                  }));

    browser.driver.manage().window().maximize();
    browser.driver.get(browser.baseUrl);
    browser.driver.findElement(by.id('weblogin_netid')).sendKeys(process.env.userId);
    browser.driver.findElement(by.id('weblogin_password')).sendKeys(process.env.password);
    browser.driver.findElement(by.css('[value=\'Sign in\']')).click();

    // wait until page is redirected
    return browser.driver.wait(function () {
      return browser.driver.getCurrentUrl().then(function (url) {
        return url.startsWith(browser.baseUrl);
      });
    }, 10000);
  }
};
