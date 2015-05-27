## Tests

### Unit Tests

Install bower dependencies:

```sh
bower i
```

Install karma (test runner) and phantomjs:

```sh
npm install -g karma-cli phantomjs
```

And run by doing:

```sh
karma start
```

By default it runs on PhantomJS but more browsers can be added to the [karma.conf.js](karma.conf.js).

### E2E Tests

In order to run the e2e tests:

Install node modules:

```sh
npm i
```

Download Chrome webdriver:

```sh
./node_modules/.bin/webdriver-manager --standalone --chrome update
```

Run the tests:

```sh
grunt scenario
```

> Note: for Google test you have to specify `GOOGLE_USER` and `GOOGLE_PASSWORD` env variable
