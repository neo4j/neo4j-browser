var myApp = angular.module('myApp');

myApp.controller('MsgCtrl', function ($scope, auth) {
  $scope.message = '';

});

myApp.controller('RootCtrl', function (auth, $scope) {
  auth.profilePromise.then(function() {
    $scope.$parent.message = 'Welcome ' + auth.profile.name + '!';
  });

  $scope.auth = auth;
});

myApp.controller('LoginCtrl', function (auth, $scope, $cookies, $state) {
  $scope.user = '';
  $scope.pass = '';

  function onLoginSuccess() {
    $scope.$parent.message = '';
    $state.go('root');
    $scope.loading = false;
  }

  function onLoginFailed() {
    $scope.$parent.message = 'invalid credentials';
    $scope.loading = false;
  }

  $scope.submit = function () {
    $scope.$parent.message = 'loading...';
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
    $scope.$parent.message = 'loading...';
    $scope.loading = true;

    auth.signin({
      popup: true,
      connection: 'google-oauth2',
      scope: 'openid name email'
    }, onLoginSuccess, onLoginFailed);
  };
});

myApp.controller('LogoutCtrl', function (auth, $scope, $state, store) {
  auth.signout();
  store.remove('profile');
  store.remove('token');
  $scope.$parent.message = '';
  $state.go('login');
});
