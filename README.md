# Content Services UI
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/d024952d66a04338b330808b4b255048)](https://www.codacy.com/app/uw-it-edm/content-services-ui?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=uw-it-edm/content-services-ui&amp;utm_campaign=Badge_Grade)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=uw-it-edm/content-services-ui)](https://dependabot.com)

develop: 
[![Build Status](https://travis-ci.org/uw-it-edm/content-services-ui.svg?branch=develop)](https://travis-ci.org/uw-it-edm/content-services-ui) [![Coverage Status](https://coveralls.io/repos/github/uw-it-edm/content-services-ui/badge.svg?branch=develop)](https://coveralls.io/github/uw-it-edm/content-services-ui?branch=develop) 

master: 
[![Build Status](https://travis-ci.org/uw-it-edm/content-services-ui.svg?branch=master)](https://travis-ci.org/uw-it-edm/content-services-ui)


# Setup for Development

## Development server

Run `yarn start-local` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Development server with mock apis
```
yarn start-mock-services
yarn start-localmock
```

Stop the containers when you are done with:
```
yarn stop-mock-services
```

## Development server with backend services hosted in AWS EC2

- Make sure you have Node v9.
- Install and configure the [AWS CLI](https://aws.amazon.com/cli/).
- Install and configure the [AWS helper scripts](https://github.com/uw-it-edm/technical-operations/tree/master/aws-helper-scripts).
- Setup the environment variables as described in the [EDM Data](https://github.com/uw-it-edm/workstation-setup/tree/master/configuration/edm-team) workstation setup. 
- Login to AWS with 'developer' role.
- Run SSH to tunnel requests to the app servers:
```
ec2TunnelToEnvAndType -p $EDM_PROFILE_API_PORT,$EDM_CONTENT_API_PORT,$EDM_SEARCH_API_PORT,$EDM_DATA_API_PORT dev apps
```
- Run Angular with the proxy setup for the remote servers (this is needed to by-pass CORS):
```
yarn start-localproxy
```
- Navigate to http://localhost:42000 watch the console to if there are any errors on the proxy url re-writting.

How it works? There is a script (`./src/environments/replace-vars.mjs`) that will inject values from environment variables into the appropiate local files that includes your NetID used to make requests to back end servers and all the port numbers.

## Run on IE11 using VirtualBox

- Follow instructions [here](https://wiki.cac.washington.edu/x/LPjFBg) to download a Windows image and load it into VirtualBox.
- Run dev server configured to produce ES5 scripts and addresses configured for virtual machine
```
 yarn start-localmock-ie11
```
- On the virtual machine, launch IE11 and navigate to `http://10.0.2.2:4200` to load the application.

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

# Setup for End-To-End Tests
Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Running end-to-end tests from local

1. Install [Docker](https://docs.docker.com/docker-for-mac/install/#download-docker-for-mac) on your machine.   
  1. Run `yarn e2e-local`

## Debug end-to-end tests from local

- Start the docker back end mock server
```
yarn start-mock-services
```
- Start the local dev server with 'travis' configuration (this is the configuration that is run by CI machine)
```
yarn start-travis
```
- Launch protractor and attach node debugger. If you [configured VSCode](https://github.com/uw-it-edm/workstation-setup/tree/master/configuration/vscode), you can run the 'Launch Protractor' configuration to automatically attach VSCode as a debugger.

  - Alternatively, you can manually run protractor with node in 'debug' mode, passing the path to the local conf.js and the base url to point to the local web server.
     ```
     node --inspect-brk ./node_modules/protractor/bin/protractor ./protractor.conf.local.js --baseUrl=http://localhost:4200
     ```
- Stop the docker container
```
yarn stop-mock-services
```

# Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

