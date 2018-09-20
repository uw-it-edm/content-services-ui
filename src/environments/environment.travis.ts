// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --configuration=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: true,

  GATracking: 'fakeCode',

  supportEmail: 'support@somedomain.com',

  tenantConfigGithubPath: '/uw-it-edm/content-services-ui-config/contents/dev',

  testUser: null,

  search_api: {
    url: 'http://localhost:12345',
    context: '/search/v1/',
    method: 'POST',
    authenticationHeader: null
  },
  content_api: {
    url: 'http://localhost:12345',
    contextV3: '/content/v3',
    contextV4: '/content/v4',
    authenticationHeader: null
  },
  profile_api: {
    url: 'http://localhost:12345',
    context: '/profile/v1',
    authenticationHeader: null
  },
  data_api: {
    url: 'http://localhost:12345',
    context: '/students/v1',
    authenticationHeader: null
  }
};
