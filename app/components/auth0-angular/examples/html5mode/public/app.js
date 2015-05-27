angular.module('auth0-sample', ['auth0', 'ngRoute', 'angular-jwt', 'angular-storage'])
.config(function (authProvider, $httpProvider, $routeProvider, $locationProvider,
  jwtInterceptorProvider) {

  $routeProvider.when('/', {
    templateUrl: 'public/main.html',
    controller: 'MainCtrl'
  })
  .when('/info', {
    templateUrl: 'public/info.html',
    controller: 'InfoCtrl',
    requiresLogin: true
  });

  authProvider.init({
    domain: 'contoso.auth0.com',
    clientID: 'DyG9nCwIEofSy66QM3oo5xU6NFs3TmvT',
    callbackURL: location.href,
    loginUrl: '/'
  });

  authProvider.on('loginSuccess', function($location, profilePromise, idToken, store) {
    profilePromise.then(function(profile) {
      store.set('profile', profile);
      store.set('token', idToken);
    });
    $location.hash('');
    $location.path('/info');
  });

  authProvider.on('loginFailure', function(error) {
    alert("Error logging in", error);
  });

  $locationProvider.hashPrefix('!');

  $locationProvider.html5Mode(true);


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
          $location.path('/');
        }
      }
    }

  });
})
.controller('MainCtrl', function($scope, auth) {

  $scope.login = function() {
    auth.signin();
  }
})
.controller('InfoCtrl', function($scope, auth, $location, store) {
  $scope.auth = auth;

  $scope.logout = function() {
    auth.signout();
    store.remove('profile');
    store.remove('token');
    $location.path('/');
  }
});
