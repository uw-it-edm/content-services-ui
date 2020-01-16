# Content Services UI
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/d024952d66a04338b330808b4b255048)](https://www.codacy.com/app/uw-it-edm/content-services-ui?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=uw-it-edm/content-services-ui&amp;utm_campaign=Badge_Grade)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=uw-it-edm/content-services-ui)](https://dependabot.com)

develop: 
[![Build Status](https://travis-ci.org/uw-it-edm/content-services-ui.svg?branch=develop)](https://travis-ci.org/uw-it-edm/content-services-ui) [![Coverage Status](https://coveralls.io/repos/github/uw-it-edm/content-services-ui/badge.svg?branch=develop)](https://coveralls.io/github/uw-it-edm/content-services-ui?branch=develop) 

master: 
[![Build Status](https://travis-ci.org/uw-it-edm/content-services-ui.svg?branch=master)](https://travis-ci.org/uw-it-edm/content-services-ui)


# Overview
TBD

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.2.6.


# Related Projects
TBD

# Setup for Development

## Development server

Run `yarn start-local` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Development server with mock apis
```
yarn mock-services && yarn start  --configuration=localmock --disable-host-check
```

Stop the containers when you are done with:
```
yarn stop-mock-services
```

## Debug in VSCode
- Add the following configuration to your launch.json file:
```
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:4200",
      "webRoot": "${workspaceFolder}"
    }
```
- Start the angular server with one of the options above.
- Lanch chrome using the launch configuration, this will start a new chrome instance in debug mode and attach VSCode to debug it.

## Debug in IntelliJ
TBD

# Setup for Unit Tests
Unit tests are written in [jasmine](https://jasmine.github.io) and run via [Karma](https://karma-runner.github.io). 

To run all unit tests in parallel on a headless browser (the same that is run during CI):
```
yarn test
```

## TDD
If you want to focus on a single test or test file, use jasmine's [focused specs](https://jasmine.github.io/2.1/focused_specs.html). You can can keep using `yarn test` to execute the selected test(s) from command line, or you can use the options below to debug them.

## TDD - Debug Unit Tests in Chrome
1. Make sure you have setup your focused test(s).
1. Run `yarn test-tdd`. This will run the karma server with source maps and launch a Chrome instance that will run your test.
1. Click the "DEBUG" button in the karma UI (top right). This will launch the debug.html page.
1. Open the developer tools and go to sources.
1. The source files will be under `webpack/./src/app`. Here you can set break points any where in the source or in the test.
1. Reload the browser to run the focused test again and hit the break point.

Note that the karma server is also running in watch mode, so any changes you make to the source code will trigger a recompilation. You can reload the browser at debug.html to load any updated code.

## TDD - Debug Unit Tests in VSCode
1. Follow the first steps as debugging in Chrome, up to launching `yarn test-tdd`. The browser that is launched by Karma is setup with a remote debugging port so that external tools can debug Chrome.
1. In VSCode modify your launch.json to include a task that can attach to the chrome instance running tests:
```
{
  "type": "chrome",
  "request": "attach",
  "name": "Attach Karma Chrome",
  "address": "localhost",
  "port": 9333,
  "sourceMaps": true,
  "sourceMapPathOverrides": {
    "webpack:///./*": "${workspaceRoot}/*"
  },
}
```
1. Launch this task. At this point you can setup break points in any source file from whithin VSCode. Reload the Chrome browser that is attached to karma to hit any breakpoint.

Note as well, that karma is running in watch mode, any changes to the source code that you make in VSCode will trigger a recompilation. One you reload the browser the new code will take affect.

## TDD - Debug Unit Tests in IntelliJ
TBD

# Setup for End-To-End Tests
Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Running end-to-end tests from local

1. Install [Docker](https://docs.docker.com/docker-for-mac/install/#download-docker-for-mac) on your machine.   
  1. Run `yarn e2e-local`

# Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

# Git Hooks / Husky
TBD

# CI/CD
TBD







