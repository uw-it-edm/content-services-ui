export const environment = {
  production: false,

  enableRouterTracing: false,

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
    app_name: 'content-services-ui',
    authenticationHeader: null
  },
  data_api: {
    url: 'http://localhost:12345/data',
    studentContext: '/students/v1',
    valueContext: '/v1/value',
    authenticationHeader: null
  }
};
