import React from 'react'

const title = 'Unrecognized command'
const content = (
  <React.Fragment>
    <p>Apologies, but that was unparseable or otherwise unrecognized</p>
    <table className='table-condensed table-help'>
      <tbody>
        {/* <tr>
        <th className='lead'>You said:</th>
        <td><code className='lead'>{{frame.input | uncomment}}</code></td>
      </tr> */}
        <tr>
          <th>Try:</th>
          <td>
            <ul>
              <li>
                <a help-topic='help'>:help</a> - for general help about using
                Neo4j Browser
              </li>
              <li>
                <a help-topic='cypher'>:help commands</a> - to see available
                commands
              </li>
              <li>
                <a href='https://neo4j.com/docs/'>Neo4j Documentation</a> - for
                detailed information about Neo4j
              </li>
            </ul>
          </td>
        </tr>
        <tr>
          <th>Keys:</th>
          <td>
            <ul>
              <li>
                <code>{`< ctrl - ↑ >`}</code> to retrieve previous entry from
                history.
              </li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  </React.Fragment>
)

export default { title, content }
