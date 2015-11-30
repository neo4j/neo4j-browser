# Refresh tokens

Mostly when building mobile apps, we want to show the signin page only once and then leave the user logged in forever. For those cases, it makes sense to have a `refreshToken`. A `refreshToken` lets us get a new `id_token` or `JWT` anytime we want. 

> **Warning**: This means that if the `refreshToken` gets compromised, unless we revoke that token, somebody would be able to get a new JWT forever.

### 1. Getting the Refresh Token

In order to be able to get the refresh token, all we need to do is add the `offline_access` scope when calling the `signin` or `signup`. Optionally, you can set the `device` parameter.

````js
auth.signin({
    authParams: {
      scope: 'openid offline_access',
      // The following is optional
      device: 'Chrome browser'
    }
});
````

### 2. Storing the refresh token

We recommend using `angular-storage` to store the refresh token. You can learn how to store information with it in [this other guide](storing-information.md).

### 3. Using the refresh token to get a new JWT

Now, you want to always send a not expired JWT to the server when calling it. For that, you'll use `angular-jwt`. You can learn how to install and configure the library in [this other guide](calling-an-api.md).

The only difference with the example on the `angular-jwt` guide is that now you'll configure the library to get a new JWT if the current one is expired:

````js
angular.module('myApp', ['auth0', 'angular-jwt'])
  .config(function($httpProvider, jwtInterceptorProvider) {
    var refreshingToken = null;
    jwtInterceptorProvider.tokenGetter = function(store, $http, jwtHelper) {
      
      var token = store.get('token');
      var refreshToken = store.get('refreshToken');
      if (token) {
        if (!jwtHelper.isTokenExpired(token)) {
          return store.get('token');
        } else {
          if (refreshingToken === null) {
            refreshingToken =  auth.refreshIdToken(refreshToken).then(function(idToken) {
              store.set('token', idToken);
              return idToken;
            }).finally(function() {
                refreshingToken = null;
            });
          }
          return refreshingToken;
        }
      }
    }

    $httpProvider.interceptors.push('jwtInterceptor');
  });
````

### 4. Using the Refresh Token on page refresh if the JWT is expired

Once the page is refreshed, you want the user to stay logged in. For that, if the JWT is expired, you'll use the `refreshToken` to get a new one:

````js
angular.module('myApp', ['auth0', 'angular-jwt', 'angular-storage'])
.run(function($rootScope, auth, store, jwtHelper, $location) {
  var refreshingToken = null;
  $rootScope.$on('$locationChangeStart', function() {
    var token = store.get('token');
    var refreshToken = store.get('refreshToken');
    if (token) {
      if (!jwtHelper.isTokenExpired(token)) {
        if (!auth.isAuthenticated) {
          auth.authenticate(store.get('profile'), token);
        }
      } else {
        if (refreshToken) {
          if (refreshingToken === null) {
              refreshingToken =  auth.refreshIdToken(refreshToken).then(function(idToken) {
                store.set('token', idToken);
                auth.authenticate(store.get('profile'), idToken);
              }).finally(function() {
                  refreshingToken = null;
              });
          }
          return refreshingToken;
        } else {
          $location.path('/login');
        }
      }
    }

  });
})
````

### 5. You've nailed it

That's it :). Now, you can check out some of our [examples](https://github.com/auth0/auth0-angular/tree/master/examples). 



