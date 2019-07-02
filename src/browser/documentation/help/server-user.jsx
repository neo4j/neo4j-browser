import React from 'react'

const title = 'User admin'
const subtitle = 'User management for administrators'
const category = 'browserUiCommands'
const content = (
  <React.Fragment>
    <p>
      The <code>:server user</code> command allows you to manage user access to
      Neo4j such as creating/deleting users, suspending/activating users,
      managing user roles and resetting passwords.
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
          <a server-topic='user list'>:server user list</a>{' '}
          <a server-topic='user add'>:server user add</a>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Notes:</p>
        <p className='content'>
          Only available in Neo4j Enterprise.
          <br />
          Only available to users with the admin role.
        </p>
      </div>
    </div>
  </React.Fragment>
)

export default { title, subtitle, category, content }
