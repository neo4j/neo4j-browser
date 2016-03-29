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
    controller: 'LoginCtrl'
  })
  .when('/', {
    templateUrl: 'views/root.html',
    controller: 'RootCtrl',
    /* isAuthenticated will prevent user access to forbidden routes */
    requiresLogin: true
  });

  $locationProvider.hashPrefix('!');

  authProvider.init({
    domain: 'contoso.auth0.com',
    clientID: 'DyG9nCwIEofSy66QM3oo5xU6NFs3TmvT',
    loginUrl: '/login'
  });

  jwtInterceptorProvider.tokenGetter = function(store) {
    return store.get('token');
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
