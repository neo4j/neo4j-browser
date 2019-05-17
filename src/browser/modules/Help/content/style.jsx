import React from 'react'

const title = 'Style'
const subtitle = 'Set visualization style'
const content = (
  <React.Fragment>
    <p>
      The <code>:style</code> command lets you modify the visual aspects of your
      graph.
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Usage:</p>
        <p className='content'>
          <code>{`:style <action>`}</code>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Actions:</p>
        <div className='content'>
          <div>
            <code>:style</code> - Display the currently active style. Select and
            copy to edit it locally.
          </div>
          <div>
            <code>{`:style <url>`}</code> - load style from an URL. Note that
            the server hosting the style file must accept cross origin requests.
          </div>
          <div>
            <code>:style reset</code> - Reset styling to it's default.
          </div>
        </div>
      </div>
    </div>
  </React.Fragment>
)

export default { title, subtitle, content }
