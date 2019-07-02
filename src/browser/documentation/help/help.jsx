import React from 'react'

const title = 'Help'
const subtitle = 'What is all this?'
const category = 'browserUiCommands'
const content = (
  <React.Fragment>
    <p>
      Neo4j Browser is a command shell. Use the editor bar up above ↑ to enter
      Cypher queries or client-side commands. Each command will produce a
      "frame" like this one in the result stream.
    </p>
    <p>
      Use the <code>:help</code> command to learn about other topics.
    </p>
    <p>New to Neo4j? Try one of the guides to learn the basics.</p>
    <table className='table-condensed table-help'>
      <tbody>
        <tr>
          <th>Usage:</th>
          <td>
            <code>{`:help <topic>`}</code>
          </td>
        </tr>
        <tr>
          <th>Topics:</th>
          <td>
            <a help-topic='cypher'>:help cypher</a>{' '}
            <a help-topic='commands'>:help commands</a>{' '}
            <a help-topic='keys'>:help keys</a>
          </td>
        </tr>
        <tr>
          <th>Guides:</th>
          <td>
            <a play-topic='intro'>:play intro</a>{' '}
            <a play-topic='concepts'>:play concepts</a>{' '}
            <a play-topic='cypher'>:play cypher</a>
          </td>
        </tr>
        <tr>
          <th>Examples:</th>
          <td>
            <a play-topic='movie graph'>:play movie graph</a>{' '}
            <a play-topic='northwind graph'>:play northwind graph</a>
          </td>
        </tr>
        {/* <tr>
        <th>Reference:</th>
        <td><a href="{{ neo4j.version | neo4jDeveloperDoc }}/">Neo4j Manual</a><br/><a href="http://neo4j.com/developer">Neo4j Developer Pages</a><br/><a href="{{ neo4j.version | neo4jCypherRefcardDoc }}/">Cypher Refcard</a></td>
      </tr> */}
      </tbody>
    </table>
  </React.Fragment>
)

export default { title, subtitle, category, content }
