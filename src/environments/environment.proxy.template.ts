// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --configuration=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

const netId = 'agagne';

export const environment = {
  production: false,

  enableRouterTracing: false,

  GATracking: 'fakeCode',

  supportEmail: 'support@somedomain.com',

  tenantConfigGithubPath: '/uw-it-edm/content-services-ui-config/contents/dev',

  testUser: netId,

  search_api: {
    url: '/search-api',
    context: '/search/v1/',
    method: 'POST',
    authenticationHeader: 'x-uw-act-as',
    headers: { 'x-uw-act-as': netId },
  },
  content_api: {
    url: 'http://localhost:11000',
    contextV3: '/v3',
    contextV4: '/v4',
    authenticationHeader: 'x-uw-act-as',
    headers: { 'x-uw-act-as': netId },
  },
  profile_api: {
    url: '/profile-api',
    context: '/profile/v1',
    app_name: 'content-services-ui',
    authenticationHeader: 'x-uw-act-as',
    headers: { 'x-uw-act-as': netId },
  },
  data_api: {
    url: '/data-api',
    studentContext: '/v1/student',
    personContext: '/v1/person',
    valueContext: '/v1/value',
    authenticationHeader: 'x-uw-act-as',
    headers: { 'x-uw-act-as': netId },
  },
};
