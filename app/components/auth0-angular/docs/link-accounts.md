## Linking Accounts

In order to link two accounts, create a link method in a controller (make sure to have the `auth` object injected):

```js
$scope.link = function () {
  auth.auth0js._callbackOnLocationHash = true;
  auth.signin({
    authParams: {
      access_token: auth.accessToken
    }
  }, function (profile, token) {
    // TODO Handle accounts linked
    console.log('linked');
  }, function () {
    // TODO Handle error
  }, 'Auth0');
};
```

Then, create an anchor in your view:

```html
<a ng-click="link()">link account</a>
```

When the user clicks on that anchor, they will be prompted to enter the credentials for the account they want to link. 

### Restricting Selection

You may want to add a `connection` parameter to restrict user selection. For instance, you can create a view that looks like this:

```html
<a ng-click="linkGoogle()">Link your Google Account</a>
<a ng-click="linkTwitter()">Link your Twitter Account</a>
```

Then, in your controller:

```js
$scope.linkGoogle = function () {
  auth.signin({
    connection: 'google-oauth2'
    authParams: {
      access_token: auth.accessToken
    }
  }, function (profile, token) {
    // TODO Handle accounts linked
    console.log('linked');
  }, function () {
    // TODO Handle error
  }, 'Auth0');

$scope.linkTwitter = function () {
  auth.signin({
    connection: 'twitter'
    authParams: {
      access_token: auth.accessToken
    }
  }, function (profile, token) {
    // TODO Handle accounts linked
    console.log('linked');
  }, function () {
    // TODO Handle error
  }, 'Auth0');
```
