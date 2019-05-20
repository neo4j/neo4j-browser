import React from 'react'

const title = 'Not found'
const subtitle = 'No guide by that name.'
const content = (
  <React.Fragment>
    <p>Apologies, but there doesn't seem to be any content about that.</p>
    <h5>Try:</h5>
    <ul>
      <li>
        <a help-topic='help'>:help</a> - for general help about using Neo4j
        Browser
      </li>
      <li>
        <a play-topic='start'>:play start</a> - to see a few available guides
      </li>
      <li>
        <a href='https://neo4j.com/docs/'>Neo4j Documentation</a> - for detailed
        information about Neo4j
      </li>
    </ul>
  </React.Fragment>
)

export default { title, subtitle, content }
