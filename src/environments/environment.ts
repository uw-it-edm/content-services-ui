// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --configuration=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,

  enableRouterTracing: false,

  GATracking: 'fakeCode',

  supportEmail: 'support@somedomain.com',

  tenantConfigGithubPath: '/uw-it-edm/content-services-ui-config/contents/dev',

  testUser: null,

  search_api: {
    url: 'search-api.dev',
    context: '/search',
    method: 'POST',
    authenticationHeader: 'auth'
  },
  content_api: {
    url: 'http://content-api.dev',
    contextV3: '/content/v3',
    contextV4: '/content/v4',
    authenticationHeader: 'auth',
    headers: {}
  },
  profile_api: {
    url: 'http://profile-api.dev',
    context: '/profile/v1',
    app_name: 'content-services-ui',
    authenticationHeader: 'auth'
  },
  data_api: {
    url: 'http://data-api.dev',
    studentContext: '/students/v1',
    personContext: '/person/v1',
    valueContext: '/v1/value',
    authenticationHeader: 'auth'
  }
};
