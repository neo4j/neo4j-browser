import React from 'react'

const title = 'History'
const subtitle = 'Show command history'
const content = (
  <React.Fragment>
    <p>
      The <code>:history</code> command will display your most recent executed
      commands.
    </p>
    <table className='table-condensed table-help'>
      <tbody>
        <tr>
          <th>Related:</th>
          <td>
            <a help-topic='history clear'>:help history clear</a>
            <a help-topic='help'>:help help</a>
            <a help-topic='commands'>:help commands</a>
          </td>
        </tr>
      </tbody>
    </table>
  </React.Fragment>
)

export default { title, subtitle, content }
