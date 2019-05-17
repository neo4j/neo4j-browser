import React from 'react'

const title = 'Commands'
const subtitle = 'Typing commands is 1337'
const content = (
  <React.Fragment>
    <p>
      In addition to composing and running Cypher queries, the editor bar up
      above ↑ understands a few client-side commands, which begin with a
      <code>:</code>. Without a colon, we'll assume you're trying to enter a
      Cypher query.
    </p>
    <table className='table-condensed table-help'>
      <tbody>
        <tr>
          <th>Information:</th>
          <td>
            <a help-topic='play'>:help play</a>
          </td>
        </tr>
        <tr>
          <th>Server:</th>
          <td>
            <a help-topic='server'>:help server</a>
          </td>
        </tr>
        <tr>
          <th>Cypher:</th>
          <td>
            <a help-topic='cypher'>:help cypher</a>
          </td>
        </tr>
        <tr>
          <th>REST:</th>
          <td>
            <a help-topic='rest-get'>:help REST GET</a>
            <a help-topic='rest-post'>:help REST POST</a>
          </td>
        </tr>
        <tr>
          <th>Params:</th>
          <td>
            <a help-topic='param'>:help param</a>
            <a help-topic='params'>:help params</a>
          </td>
        </tr>
        <tr>
          <th>Query status:</th>
          <td>
            <a help-topic='queries'>:help queries</a>
          </td>
        </tr>
        <tr>
          <th>Styling visualization:</th>
          <td>
            <a help-topic='style'>:help style</a>
          </td>
        </tr>
      </tbody>
    </table>
  </React.Fragment>
)

export default { title, subtitle, content }
