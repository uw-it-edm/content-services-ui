// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
const testReportsPath = './e2e/test-reports';

const setJasmineReporter = function () {
  let jasmineReporters = require('jasmine-reporters');
  return browser.getProcessedConfig().then(function (config) {
    let browserName = config.capabilities.browserName;
    let junitReporter = new jasmineReporters.JUnitXmlReporter({
                                                                consolidateAll: true,
                                                                savePath: testReportsPath,
                                                                filePrefix: browserName
                                                                            + '-xmloutput',
                                                                modifySuiteName: function (generatedSuiteName) {
                                                                  return browserName + ' - '
                                                                         + generatedSuiteName;
                                                                }
                                                              });
    jasmine.getEnv().addReporter(junitReporter);
  });
};

exports.config = {
  allScriptsTimeout: 1200000,
  specs: [
    './e2e/**/*.e2e-spec.ts'
  ],
  multiCapabilities: [
    {
      'browserName': 'chrome',
      chromeOptions: {
        args: ["--headless", "--disable-gpu", "--window-size=1280,1024"]
      }
    }
  ],
  directConnect: true,
  baseUrl: process.env.baseUrl,
  framework: 'jasmine2',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function () {
    }
  },

  beforeLaunch: function () {
    //clean up any residual/leftover from a previous run.
    let fs = require('fs');
    let testReportsFile = testReportsPath + '/*.xml';
    if (fs.existsSync(testReportsFile)) {
      fs.unlink(testReportsFile);
    }
  },

  onPrepare() {
    require('ts-node').register({project: 'e2e/tsconfig.e2e.json'});

    jasmine.getEnv().addReporter(new SpecReporter({spec: {displayStacktrace: true}}));

    setJasmineReporter();

    // remote access files for uploading in tests
    let remote = require('selenium-webdriver/remote');
    browser.setFileDetector(new remote.FileDetector());

    // login to netid
    browser.driver.get(browser.baseUrl);
    browser.driver.manage().window().maximize();
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
