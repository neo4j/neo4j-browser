angular.module( 'sample.home', [
'auth0'
])
.controller( 'HomeCtrl', function HomeController( $scope, auth, $http, $location, store ) {

  $scope.auth = auth;

  $scope.$watch(function() {
    return store.get('firebaseToken')
  }, function(firebaseToken) {
    $scope.firebaseToken = firebaseToken;
  });


  $scope.logout = function() {
    auth.signout();
    $location.path('/login');
  }

});
