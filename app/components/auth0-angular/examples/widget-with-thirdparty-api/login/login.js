angular.module( 'sample.login', [
  'auth0'
])
.controller( 'LoginCtrl', function HomeController( $scope, auth, $location, store ) {

  $scope.login = function() {
    auth.signin({}, function(profile, token) {
      store.set('profile', profile);
      store.set('token', token);
      auth.getToken({
        api: 'firebase'
      }).then(function(firebaseToken) {
        store.set('firebaseToken', firebaseToken.id_token);
      });
      $location.path("/");
    }, function(error) {
      console.log("There was an error logging in", error);
    });
  }

});
