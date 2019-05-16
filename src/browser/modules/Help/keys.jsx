import React from 'react'

const title = 'Keys'
const subtitle = 'Keyboard shortcuts'
const content = (
  <React.Fragment>
    <table className='table-condensed table-help table-help--keys'>
      <thead>
        <tr>
          <th>Editor action</th>
          <th>Any mode</th>
          <th>Single-line mode</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Execute current command</td>
          <td>
            <div className='key code'>&lt;Ctrl-Return&gt;</div>
          </td>
          <td>
            <div className='key code'>&lt;Return&gt;</div>
          </td>
        </tr>
        <tr>
          <td>Previous command in history</td>
          <td>
            <div className='key code'>&lt;Ctrl-Up-Arrow&gt;</div>
          </td>
          <td>
            <div className='key code'>&lt;Up-Arrow&gt;</div>
          </td>
        </tr>
        <tr>
          <td>Next command in history</td>
          <td>
            <div className='key code'>&lt;Ctrl-Down-Arrow&gt;</div>
          </td>
          <td>
            <div className='key code'>&lt;Down-Arrow&gt;</div>
          </td>
        </tr>
        <tr>
          <td>Switch to multi-line editing</td>
          <td />
          <td>
            <div className='key code'>&lt;Shift-Return&gt;</div>
          </td>
        </tr>
        <tr>
          <td />
        </tr>
        <tr>
          <th>Global actions</th>
          <th />
          <th />
        </tr>
        <tr>
          <td>Change focus to editor</td>
          <td>
            <div className='key code'>/</div>
          </td>
        </tr>
        <tr>
          <td>Toggle fullscreen editor</td>
          <td>
            <div className='key code'>Esc</div>
          </td>
        </tr>
        <tr>
          <td />
        </tr>
        <tr>
          <th>Platform specific</th>
          <th />
          <th />
        </tr>
        <tr>
          <td>Mac users</td>
          <td>
            Use <span className='key code'>Cmd</span> instead of{' '}
            <span className='key code'>Ctrl</span>
          </td>
        </tr>
      </tbody>
    </table>
  </React.Fragment>
)

export default { title, subtitle, content }
