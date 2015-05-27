var myApp = angular.module('myApp');

myApp.controller('MenuCtrl', function ($scope, $location) {
  $scope.go = function (target) {
    $location.path(target);
  };
});

myApp.controller('MsgCtrl', function ($scope, auth) {
  $scope.message = '';
});

myApp.controller('RootCtrl', function (auth, $scope) {
  $scope.auth = auth;
});

myApp.controller('LoginCtrl', function (auth, $scope, $location, $http, store) {
  $scope.user = '';
  $scope.pass = '';

  function onLoginSuccess(profile, token) {
    $scope.loading = false;
    $location.path('/');
    store.set('profile', profile);
    store.set('token', token);
  }

  function onLoginFailed() {
    $scope.loading = false;
    alert('Login failed');
  }

  $scope.signup = {user: '', pass: '', favColor: 'red'};
  $scope.doLogin = function () {
    $scope.loading = true;

    auth.signin({
      connection: 'Username-Password-Authentication',
      username:   $scope.user,
      password:   $scope.pass
    }, onLoginSuccess, onLoginFailed);
  };

  $scope.doSignup = function () {
    $http({method: 'POST', url: '/custom-signup',
    data: {
      email:    $scope.signup.user,
      password:     $scope.signup.pass,
      favColor: $scope.signup.favColor
    }})
    .success(function (data, status, headers, config) {
      if (status === 200) {
        auth.signin({
          // Make sure that connection matches your server-side connection id
          connection: 'Username-Password-Authentication',
          username:   $scope.signup.user,
          password:   $scope.signup.pass
        }, onLoginSuccess, onLoginFailed);
      }
    })
    .error(function (data, status, headers, config) {
      alert('Error creating account for user ' + $scope.signup.user + ': '  + data);
    });
  };
});

myApp.controller('LogoutCtrl', function (auth, $scope, $location, store) {
  auth.signout();
  store.remove('profile');
  store.remove('token');
  $location.path('/login');
});
