# Neo4j Browser

## Development setup

1.  Clone this repo
1.  Install yarn globally (not required but recommended): `npm install -g yarn`
1.  Install project dependencies: `yarn`

### Development server

`yarn start` and point your web browser to `http://localhost:8080`. (Windows `yarn startnodash`)

### Testing

`yarn test` to run a single test run. A linter will run first.

`yarn dev` to have continuous testing on every file change.

#### E2E Suite

`yarn e2e` to run the cypress js test suite (requires a fresh installation of neo4j to run against, expects neo4j 3.4 by default).
`yarn e2e --env server=3.3` to only run cypress js tests valid for neo4j server version 3.3.

To run on an existing server (with a password already set), you can use any of these (the default apssword is set to "newpassword"):  
`yarn e2e-local --end server=3.4`  
`yarn e2e-local-open --end server=3.4`  
The latter just opens Cypress runner so you can see the tests being executed and run only some of them. Very useful when writing tests.

There are also e2e tests that covers import from CSV files. To run thise, copy the `e2e_tests/files/import.csv` to the `import/` directory of the database you want to run the tests on and then start the e2e tests with the `--env include-import-tests=true` flag.
Example: `yarn e2e-local-open --env server=3.4 --env include-import-tests=true`

## Devtools

Download these two chrome extensions:

* [Redux devtools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
* [React devtools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
