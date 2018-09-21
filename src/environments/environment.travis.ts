export const environment = {
  production: true,

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
    authenticationHeader: null
  },
  data_api: {
    url: 'http://localhost:12345',
    context: '/students/v1',
    authenticationHeader: null
  }
};
