import React from 'react'

const title = 'Clear'
const subtitle = 'Reset the stream'
const category = 'browserUiCommands'
const content = (
  <React.Fragment>
    <p>
      The <code>:clear</code> command will remove all frames from the stream.
    </p>
    <table className='table-condensed table-help'>
      <tbody>
        <tr>
          <th>Related:</th>
          <td>
            <a help-topic='help'>:help help</a>
            <a help-topic='commands'>:help commands</a>
          </td>
        </tr>
      </tbody>
    </table>
  </React.Fragment>
)

export default { title, subtitle, category, content }
