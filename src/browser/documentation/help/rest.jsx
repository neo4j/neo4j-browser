import React from 'react'

const title = 'REST'
const subtitle = 'Any HTTP verb'
const category = 'restApiCommands'
const content = (
  <React.Fragment>
    <p>
      The editor bar has convenience commands for sending any HTTP verb help to
      Neo4j's REST API. For PUT and POST, include a JSON payload.
    </p>
    <table className='table-condensed table-help'>
      <tbody>
        <tr>
          <th>Related:</th>
          <td>
            <a help-topic='rest-get'>:help REST GET</a>,
            <a help-topic='rest-post'>:help REST POST</a>,
            <a help-topic='rest-put'>:help REST PUT</a>,
            <a help-topic='rest-delete'>:help REST DELETE</a>
          </td>
        </tr>
      </tbody>
    </table>
  </React.Fragment>
)

export default { title, subtitle, category, content }
