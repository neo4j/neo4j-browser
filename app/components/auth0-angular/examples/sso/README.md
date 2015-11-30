# SSO Example

This example shows how to use SSO with Angular. **The most important thing is to activate SSO on `authProvider` options. [Check this](https://github.com/auth0/auth0-angular/blob/master/examples/sso/scripts/myApp.js#L24-L34)**

Also, you can check out [more information about SSO here](https://auth0.com/docs/sso/single-sign-on) and a full repository with both SPAs and Regular WebApp samples working with SSO [here](https://github.com/auth0/auth0-sso-sample)

### Running the example

In order to be able to test SSO correctly, you must have more than one application and each must have its own domain. For that, you can edit your `/etc/hosts` and make app1.com and app2.com point to `127.0.0.1`.

For that, open `/etc/hosts` and edits as follows:

````
##
# Host Database
#
# localhost is used to configure the loopback interface
# when the system is booting.  Do not change this entry.
##
127.0.0.1 localhost
255.255.255.255 broadcasthost
::1             localhost 
# ...
127.0.0.1 app1.com
````

Once that's done, just start this project twice in different ports. For that, we recommend using `serve` which is installed with `npm`by doing `npm i -g serve`.

````
serve --port 3001
serve --port 3000
````

Now, you can go to `app1.com:3000`, login there and then go to `app2.com:3001`and you'll see that you're already logged in thanks to SSO :).
