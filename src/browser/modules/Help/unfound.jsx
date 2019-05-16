import React from 'react'

const title = 'Not found'
const subtitle = 'No content by that name.'
const content = (
  <React.Fragment>
    <p>Apologies, but there doesn't seem to be any content about that.</p>
    <table className='table-condensed table-help'>
      <tbody>
        {/* <tr>
        <th className='lead'>You said:</th>
        <td><code className='lead'>{{frame.input | uncomment}}</code></td>
      </tr> */}
        <tr>
          <th>
            <h5>Try: </h5>
          </th>
          <td>
            <div>
              <a help-topic='help'>:help</a> - for general help about using
              Neo4j Browser
            </div>
            <div>
              <a help-topic='cypher'>:help commands</a> - to see available
              commands
            </div>
            <div>
              <a href='https://neo4j.com/docs/'>Neo4j Documentation</a> - for
              detailed information about Neo4j
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </React.Fragment>
)

export default { title, subtitle, content }
