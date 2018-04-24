# Neo4j Browser

## Development setup
1. Clone this repo
1. Install yarn globally (not required but recommended): `npm install -g yarn`
1. Install project dependencies: `yarn`

### Development server
`yarn start` and point your web browser to `http://localhost:8080`. (Windows `yarn startnodash`)

### Testing
`yarn test` to run a single test run. A linter will run first.

`yarn dev` to have continuous testing on every file change.

#### E2E Suite
`yarn e2e` to run the cypress js test suite (requires a fresh installation of neo4j to run against, expects neo4j 3.4 by default)
`yarn e2e --env server=3.3` to only run cypress js tests valid for neo4j server version 3.3

## Devtools
Download these two chrome extensions:
- [Redux devtools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
- [React devtools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
