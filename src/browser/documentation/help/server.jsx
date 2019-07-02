import React from 'react'

const title = 'Server'
const subtitle = 'Server connection management'
const category = 'browserUiCommands'
const content = (
  <React.Fragment>
    <p>
      The <code>:server</code> command lets you manage the connection to Neo4j,
      such as connecting, disconnecting and viewing metadata for the current
      connection.
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Usage:</p>
        <p className='content'>
          <code>{`:server <action>`}</code>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Actions:</p>
        <p className='content'>
          <a server-topic='status'>:server status</a>{' '}
          <a server-topic='change-password'>:server change-password</a>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Auth:</p>
        <p className='content'>
          <a server-topic='connect'>:server connect</a>{' '}
          <a server-topic='disconnect'>:server disconnect</a>
        </p>
      </div>
      <div className='link'>
        <p className='title'>User:</p>
        <p className='content'>
          <a help-topic='server-user'>:help server user</a>
        </p>
      </div>
    </div>
  </React.Fragment>
)

export default { title, subtitle, category, content }
