define(['angular', 'auth0', 'auth0-angular', 'angular-route', 'angular-jwt', 'angular-storage'], function (angular, Auth0) {
  angular.element(document).ready(function() {
    angular.bootstrap(document, ['myApp']);
  });

  var myApp = angular.module('myApp', [
    'auth0', 'ngRoute', 'angular-jwt', 'angular-storage'
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
      requiresLogin: true
    });



    authProvider.init({
      domain: 'contoso.auth0.com',
      clientID: 'DyG9nCwIEofSy66QM3oo5xU6NFs3TmvT',
      loginUrl: '/login'
    },
    // Here we are specifying which constructor to use. If you are using
    // Auth0 widget you may want to inject Auth0Widget constructor here.
    Auth0);

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



  return myApp;
});
