
# 4.0.X

## 4.0.3 & 4.0.4
* Added loginAfterSignup support

## 4.0.2
* Fixed bug with SSO

## 4.0.1
* Fixed minification problem with `auth0-angular` and `Lock`

## 4.0.0

* `getToken` method now returns the full delegation object instead of just the `id_token`. This **breaks backward compatibility** with the previous version. It lets you use `auth0-angular` for other delegations besides Auth0 like Amazon which doesn't return an `id_token`
* Post install script has been removed. It forced people using this library to have `bower` installed.
* This library can now be configured from both the `config` method via the `authProvider.init` as well as anywhere else in the app via the `auth.init` method.
* Bumped auth0.js version. When using `refresh_token` and getting a new `id_token`, now original scopes are remembered.
* `SSO` method has been fixed. `name` is now sent instead of `strategy`

# 3.0.X

## 3.0.6
* Added versioning info to built files

## 3.0.5
* Fixed bug with IE and `Function.name`
* Added `redirect` mode example for `Auth0.js`

## 3.0.4
* Now the signin by default shows the signup and reset buttons

## 3.0.3
* Tutorial fixes for when the page is refreshed and the JWT is expired
* Added handling for the case when JWT is expired, page is refreshed and a RefreshToken is used to refresh the page.

## 3.0.2
* Minor fixes

## 3.0.1
* Minor fixes

## 3.0.0
* Magic is removed. `auth0-angular` is now much smaller and with less magic
* We recommend the usage of `angular-storage` and `angular-jwt` for storing information and token handling
* All samples were redone. 
* New tutorials are made to teach people how to use the new dependencies
* We've migrated to Auth0 Lock

# 2.2.X

## 2.2.8
* Fixed bug when using auth0js library

## 2.2.7
* Added `authenticated` event for after refresh

## 2.2.6
* BugFix with `sso: true`

## 2.2.5
* Added `tokenPayload` to `auth`

## 2.2.3
* Fixed bug with email not recognized as possible parameter to do /ro

## 2.2.2
* Small BugFix for Refresh Token

## 2.2.0
* Default storage service is now `localStorage`. It can fallback to `ngCookies`. More info [here](https://github.com/auth0/auth0-angular/blob/master/docs/custom-storage.md)

# 2.1.X

## 2.1.0
* Added Refresh Token behaviour mostly for usage in Mobile apps. More info [here](https://github.com/auth0/auth0-angular/blob/master/docs/refreshToken.md)

# 2.0.X

## 2.0.7
* Fixed error when no callback was added
* Added `changePassowrd` behaviour for `reset` call if auth0.js is injected

## 2.0.4
* Fixed error when signin was failling with auth0.js and still saving undefined cookies.

## 2.0.3

* Added new delegation methods according to new `auth0.js` release.

## 2.0.2
* Fixed bug with redirect mode and callbacks
* Added `auth.profilePromise` field for using promises.

## 2.0.1
* Fixed bug with Username-Password not working when using minified auth0-angular.js

## 2.0.0

* We've removed promised for `signin`, `signup` and `reset`. Promises can only be fullfilled once. Therefore, if a person would open the signin widget and put the wrong password 3 times and then put it ok, the promise was never notified of the success. That's why we changed only for these 3 to callbacks. This is a breaking change and that's why we're releasing 2.0.0.

# 1.1.x

## 1.1.5
* Updated documentation to add custom storage
* When forbiden, deleting stored values

## 1.1.3
* Implemented token expired functionality. Fixes #54
* Updated all documentation

## 1.1.2
* Added `signup` and `reset` functions to trigger the widget in those modes


## 1.1.1
* Added `hookEvents` method in `auth` to hook all events once the app is started.
* Calling `logout` event once signout is done

## 1.1.0
  * Better popup handling (powered by Winchan).
  * Phonegap support.
  * updated examples: Auth0.js to 3.1 and Widget to 5.0.

## 1.0.1
  * Added `sso` configuration to the `authProvider` to use `SSO`.

# 1.0.x

## 1.0.0
  * We've refactored the code to improve code quality
  * We've improved `redirect` feature of the SDK. Now, the `redirect` feature parses the hash with the `accessToken` as part of Angular's URL changing process
  * We've added `requiresLogin` paramter to routes to specify if a route is protected or not. If a user tries to get to a protected route, he'll be redirected to the login page
  * We've added the `refreshToken` method to easily refresh the JWT token that we have
  * We've added a better way to subscribe to events like `loginSuccess`  and `loginFailure`. This events now receive all the properties from authentication and you can inject any AngularJS service in there to use.
  * We've extracted the token saving module to `auth0.storage` module so that if you want to implement your own storage instead of using `ngCookies`  you easily can if you use `authStorage` interface.
  * Now you just need to add one `auth0` module to your project and it'll work for either `redirect`, `poppup` and it includes the `$httpInterceptor`  that sends the JWT.
  * All the examples and documentation have been updated for this new interface
  * Lots of other small bug and fixes

# 0.4.x

## 0.4.7
  * Added `state` to `auth` when getting values from hash or cookies.

## 0.4.5

  * Now on `logout` we are disposing properly `profile` and `delegatedTokens`.

## 0.4.4

  * Fixes issues with Auth0 and Auth0Widget minified versions: When on 0.4.3 it was made compatible with RequireJS a check to `constructor.name` was used to make sure the name of the constructor instance. When tested against the minified versions that value was the name of the minified constructor name (so it always executed the code for the widget which receives callback as third parameter). Now this check is performed by asserting getClient method to be present (part of Auth0 Widget but not Auth0.js).

## 0.4.3

  * Fixes Auth0Widget check to be compatible with requireJS.

## 0.4.2

  * Adding `main` attribute to `package.json`

## 0.4.1

  * Fixing `isAuthenticated` bug: when `idToken` expired `isAuthenticated` still was set to true.

## 0.4.0

  * Adding support for Auth0 Widget with popup mode (only social).

# 0.3.x


## 0.3.3

  * Fixed bug on `authInterceptor`: when `$http` request failed it executed `success` instead of `error` callback.

## 0.3.2

  * Adding event AUTH_EVENTS.loginFailed to replace AUTH_EVENTS.loginFailure. From this version, usage of AUTH_EVENTS.loginFailed is deprecated.

## 0.3.1

  * Fixed redirect mode: fixing exception when reloading a page after authentication.

## 0.3.0

  * The default way of showing social connections is by using popup. If you want to use redirect mode, you may want to check the new redirect example.
  * Renamed module `auth0-auth` to be `auth0`. Old `auth0` module is called now `auth0-redirect`.
  * The `auth.loaded` promise, which allows the user to tell whether or not the page has loaded, was added
  * `AUTH_EVENTS.redirectEnded` now is fired always (even after `AUTH_EVENTS.loginSuccess` and `AUTH_EVENTS.loginFailed`).
  * Now `auth.signin` method returns a promise:
    ```js
      auth.signin({connection: 'my-connection'}).then(function () {
        // When user is authenticated
      }, function () {
        // On invalid credentials
      });
    ```
  * Replaced $safeApply with $timeout.

# 0.2.x

## 0.2.0

 * There is only one instance of `auth.profile`. When doing `getProfile` the promise returns `auth.profile` not a new instance.
 * `auth.profile` by default starts as an empty object that will be later populated when the `getProfile` promise is resolved.
 * `authProvider.init` was changed to `authProvider.init(options, [Auth0Constructor]). `Auth0Constructor` is a constructor (function that can be `new`ed) that could be either Auth0 (found in auth0.js) or Auth0Widget (found in auth0-widget). RequireJS users now are able to parametrize the constructor to be used.

# 0.1.x

## 0.1.2

 * Version 1.2.16 of Angular changed the behavior of how `$cookies` handles `$cookies.hello = undefined`. In the past, it erased `hello` but now serializes `undefined` as `"undefined"`. Replacing `$cookies` with `$cookieStore` (which handle serialization) to avoid further problems.
 * Adding error handling when cookie parsing fails so it does not break the library.
 * Updating Angular version to 1.2.16.

## 0.1.1

 * Profile is no longer saved in cookies as, in some cases, it was bigger than the maximum allowed size. Current policy is to store it in memory and each time page reloads fetch it again.
 * Fixed: when login fails the proper error object is sent in the `AUTH_EVENTS.loginFailed` event.
 * Fixing bug that made `getToken` method fail: As `getToken` is not exposed by the widget it should be accessed using the `getClient` method that returns the auth0.js wrapped instance.

## 0.1.0

 * Added `AUTH_EVENTS.redirectEnded` event that is emitted when the callback URL is parsed but it does not contain neither `access_token` nor `error`. On that way, it can be determined whether the redirect ended to execute an action. For example, this is useful with the `AUTH_EVENTS.loginSuccess` and `AUTH_EVENTS.loginFailed` to show a loading page while being redirected.

# 0.0.x

## 0.0.2

 * Removed promises from `signin` method. Now the way to handle login is by listening to `AUTH_EVENTS.loginSuccess`:

   ```js
       $rootScope.$on(AUTH_EVENTS.loginSuccess, function () {
        // TODO Handle when login succeeds
        $location.path('/');
       });
   ```
 * Removed `ngRoute` and `route` from auth0-angular.
 * Created a dictionary with the authentication events:

    ```js
      myApp.run(function ($rootScope, AUTH_EVENTS) {
        $rootScope.$on(AUTH_EVENTS.loginSuccess, function () {
          // TODO Handle login success here!
        });
      });
    ```
 * `authInterceptor` must to be added explicitely on the user code. The idea behind this is to prevent leaking the token in CORS requests.

