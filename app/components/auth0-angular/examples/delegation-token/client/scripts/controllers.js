var myApp = angular.module('myApp');

myApp.controller('MenuCtrl', function ($scope, $location) {
  $scope.go = function (target) {
    $location.path(target);
  };
});

myApp.controller('MsgCtrl', function ($scope, auth) {
  $scope.message = '';
});

myApp.controller('RootCtrl', function (auth, $scope, $location, $http) {
  $scope.auth = auth;

  $scope.sendProtectedMessage = function () {
    $http({method: 'GET', url: '/api/protected'})
      .success(function (data, status, headers, config) {
        $scope.result = 'Protected data was: ' + data;
      });
  };

  $scope.sendProtectedMessageToSecondaryApp = function () {
    $http({method: 'GET', url: 'http://localhost:33000/api/protected'})
    .success(function (data) {
      $scope.result = 'Protected data from secondary app was: ' + data;
    });
  };
});

myApp.controller('LoginCtrl', function (auth, $scope, $location, store) {
  $scope.user = '';
  $scope.pass = '';

  function onLoginSuccess(profile, token) {
    $scope.$parent.message = '';
    $scope.loading = false;
    store.set('profile', profile);
    store.set('token', token);
    $location.path('/');
  }

  function onLoginFailed() {
    $scope.loading = false;
    $scope.$parent.message = 'invalid credentials';
  }

  $scope.submit = function () {
    $scope.loading = true;
    auth.signin({
      connection: 'Username-Password-Authentication',
      username: $scope.user,
      password: $scope.pass,
      authParams: {
        scope: 'openid name email'
      }
    }, onLoginSuccess, onLoginFailed);
  };

  $scope.doGoogleAuthWithPopup = function () {
    $scope.loading = true;

    auth.signin({
      popup: true,
      connection: 'google-oauth2',
      authParams: {
        scope: 'openid name email'
      }
    }, onLoginSuccess, onLoginFailed);
  };

});

myApp.controller('LogoutCtrl', function (auth, $scope, $location) {
  auth.signout();
  $scope.$parent.message = '';
  $location.path('/login');
});
