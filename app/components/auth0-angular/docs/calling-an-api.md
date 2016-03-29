# Calling an API

You can use `angular-jwt` to always send the `Authorization` header with the JWT when calling an API to make authenticated requests. 

In this tutorial, you'll learn how to do this.

### 1. Including angular-jwt dependency

The first thing you should do is adding `angular-jwt` dependency. Follow [this link](https://github.com/auth0/angular-jwt#installing-it) to learn how to install it via npm, bower or manually. Once you've done that, just include `angular-storage` module to your application:

````js
angular.module('myApp', ['auth0', 'angular-jwt']);
````

### 2. Configuring the jwtInterceptor

You should configure the `jwtInterceptor` to always send the JWT. You can get that JWT from the `auth` service or if we're using `angular-storage` to store the user information, we can get it from there. To learn how to store the profile and token information, please follow [this other guide](storing-information.md)

````js
angular.module('myApp', ['auth0', 'angular-jwt'])
  .config(function($httpProvider, jwtInterceptorProvider) {
    jwtInterceptorProvider.tokenGetter = function(auth) {
      return auth.idToken;
      // or
      // return store.get('token');
    }

    $httpProvider.interceptors.push('jwtInterceptor');
  });
````
### 3. You've nailed it

That's it :). Now, you can check out some of our [examples](https://github.com/auth0/auth0-angular/tree/master/examples). 

