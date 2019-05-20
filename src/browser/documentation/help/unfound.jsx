import React from 'react'

const title = 'Not found'
const subtitle = 'No content by that name.'
const content = (
  <React.Fragment>
    <p>Apologies, but there doesn't seem to be any content about that.</p>
    {/*
    <h5>You said:</h5>
    <p><code className='lead'>{{frame.input | uncomment}}</code></p>
    */}
    <h5>Try:</h5>
    <ul>
      <li>
        <a help-topic='help'>:help</a> - for general help about using Neo4j
        Browser
      </li>
      <li>
        <a help-topic='cypher'>:help commands</a> - to see available commands
      </li>
      <li>
        <a href='https://neo4j.com/docs/'>Neo4j Documentation</a> - for detailed
        information about Neo4j
      </li>
    </ul>
  </React.Fragment>
)

export default { title, subtitle, content }
