## Routing

### Redirect to route if user is not authenticated

If you have multiple routes and you want to control what routes are anonymous, what routes need authentication and even do some custom logic to decide whether or not the user can access a route, read below.

#### UI Router

Add a `data` field to the states you want to restrict with some information of the rule you want to apply:

```js
myApp.config(function($stateProvider, $urlRouterProvider, $httpProvider, authProvider) {
  $urlRouterProvider.otherwise('/login');

  $stateProvider
  .state('logout', { url: '/logout', templateUrl: 'views/logout.html', controller: 'LogoutCtrl' })
  .state('login', { url: '/login', templateUrl: 'views/login.html', controller: 'LoginCtrl' })
  .state('root', { url: '/', templateUrl: 'views/root.html', controller: 'RootCtrl', data: { requiresLogin: true } });

});
```

Then, when configuring the `authProvider` just set the `loginState` to the name of the state to redirect to if the user doesn't have access to a certain webpage:

```js
  myApp.config(function (authProvider) {
    authProvider.init({ 
      domain: 'yourdomain.auth0.com', 
      clientID: 'YOUR_CLIENT_ID',  
      loginState: 'login' // matches login state
    });
    
  });
```

#### ngRoute (Angular default routes)

Then, add the `requiresLogin` property in the route that requires the user to be logged in:

```js
myApp.config(function ($routeProvider) {
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
    /* isAuthenticated will prevent user access to forbidden routes */
    requiresLogin: true
  })
});
```

Then, when configuring the `authProvider` just set the `loginUrl` to the name of the state to redirect to if the user doesn't have access to a certain webpage:

```js
  myApp.config(function (authProvider) {
    authProvider.init({ 
      domain: 'yourdomain.auth0.com', 
      clientID: 'YOUR_CLIENT_ID',  
      loginUrl: '/login' // matches login url
    });
    
  });
```
