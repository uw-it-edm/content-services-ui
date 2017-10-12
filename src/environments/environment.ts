// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,

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
    context: '/content/v3',
    contextV4: '/content/v4',
    authenticationHeader: 'auth'
  }
};
