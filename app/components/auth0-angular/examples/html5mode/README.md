# Html5 Mode on auth0-angular

This shows how to use html5mode with Auth0-angular.

There's a bug with ngRoute, so the response with the accessToken which is `http://yoururl.com/#id_token` gets rewritten and the hash is removed: `http://yoururl.com/id_token`, so we need to implement a work around for this.

In order to fix that, we need to do 2 things:

1. Add `$locationProvider.hashPrefix('!')` to your config. This will make `ngRoute` not rewrite the URLs. Check it [here](https://github.com/auth0/auth0-angular/blob/master/examples/html5mode/public/app.js#L29)
2. Add `auth.hookEvents()` to the run of your app, so that all events that `auth` service is listening are run on startup. [Check here](https://github.com/auth0/auth0-angular/blob/master/examples/html5mode/public/app.js#L29)

## Running the example

Just download node and run:

````bash
npm install
node server.js
````
