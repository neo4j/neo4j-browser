var myApp = angular.module('myApp', [
  'ngCookies', 'auth0', 'ui.router', 'angular-jwt', 'angular-storage'
]);

myApp.config(function($stateProvider, $urlRouterProvider, $httpProvider,
  authProvider, $locationProvider, jwtInterceptorProvider) {

  // For any unmatched url, redirect to /login
  $urlRouterProvider.otherwise('/home');

  // Now set up the states
  $stateProvider
  .state('logout', {
    url: '/logout',
    templateUrl: 'views/logout.html',
    controller: 'LogoutCtrl'
  })
  .state('login', {
    url: '/login',
    templateUrl: 'views/login.html',
    controller: 'LoginCtrl'
  })
  .state('root', {
    url: '/home',
    templateUrl: 'views/root.html',
    controller: 'RootCtrl',
    data: {
      requiresLogin: true
    }
  });


  authProvider.init({
    domain: 'contoso.auth0.com',
    clientID: 'DyG9nCwIEofSy66QM3oo5xU6NFs3TmvT',
    loginState: 'login'
  });


  // Add a simple interceptor that will fetch all requests and add the jwt token to its authorization header.
  // NOTE: in case you are calling APIs which expect a token signed with a different secret, you might
  // want to check the delegation-token example

  jwtInterceptorProvider.tokenGetter = function(store) {
    return store.get('token');
  }

  // Add a simple interceptor that will fetch all requests and add the jwt token to its authorization header.
  // NOTE: in case you are calling APIs which expect a token signed with a different secret, you might
  // want to check the delegation-token example
  $httpProvider.interceptors.push('jwtInterceptor');
}).run(function($rootScope, auth, store, jwtHelper, $state) {
  $rootScope.$on('$locationChangeStart', function() {
    if (!auth.isAuthenticated) {
      var token = store.get('token');
      if (token) {
        if (!jwtHelper.isTokenExpired(token)) {
          auth.authenticate(store.get('profile'), token);
        } else {
          $state.go('login');
        }
      }
    }

  });
});
