var myApp = angular.module('myApp', [
  'ngCookies', 'auth0', 'ngRoute', 'angular-storage', 'angular-jwt'
]);

myApp.config(function ($routeProvider, authProvider, $httpProvider,
  $locationProvider, jwtInterceptorProvider) {
  $routeProvider
  .when('/logout',  {
    templateUrl: 'views/logout.html',
    controller: 'LogoutCtrl'
  })
  .when('/login',   {
    templateUrl: 'views/login.html',
    controller: 'LoginCtrl',
  })
  .when('/', {
    templateUrl: 'views/root.html',
    controller: 'RootCtrl',
    /* isAuthenticated will prevent user access to forbidden routes */
    requiresLogin: true
  });

  $locationProvider.hashPrefix('!');

  authProvider.init({
    clientID: 'BUIJSW9x60sIHBw8Kd9EmCbj8eDIFxDC',
    domain: 'samples.auth0.com',
    callbackURL: location.href,
    loginUrl: '/login'
  });

  $httpProvider.interceptors.push('jwtInterceptor');

  jwtInterceptorProvider.tokenGetter = function(store, config, auth) {
    var targetClientId = 'vYPeq7LGf1utg2dbDlGKCwGKgy94lPH0'; // Another App
    if (config.url.indexOf('http://localhost:33000') === 0) {
      return auth.getToken({
        targetClientId: targetClientId
      }).then(function(delegation) {
        return delegation.id_token;
      });
    } else {
      return store.get('token');
    }
  }

  // Add a simple interceptor that will fetch all requests and add the jwt token to its authorization header.
  // NOTE: in case you are calling APIs which expect a token signed with a different secret, you might
  // want to check the delegation-token example
  $httpProvider.interceptors.push('jwtInterceptor');
}).run(function($rootScope, auth, store, jwtHelper, $location) {
  $rootScope.$on('$locationChangeStart', function() {
    if (!auth.isAuthenticated) {
      var token = store.get('token');
      if (token) {
        if (!jwtHelper.isTokenExpired(token)) {
          auth.authenticate(store.get('profile'), token);
        } else {
          $location.path('/login');
        }
      }
    }

  });
});
