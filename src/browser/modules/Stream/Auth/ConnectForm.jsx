import React from 'react'

import {FormButton} from 'nbnmui/buttons'

const ConnectForm = (props) => (
  <div>
    <form>
      <ul>
        <li>
          <label>Host</label>
          <input onChange={props.onHostChange} value={props.host} />
        </li>
        <li>
          <label>Username</label>
          <input onChange={props.onUsernameChange} value={props.username} />
        </li>
        <li>
          <label>Password</label>
          <input onChange={props.onPasswordChange} value={props.password} />
        </li>
      </ul>
      <FormButton onClick={props.onConnectClick}>Connect</FormButton>
    </form>
  </div>
)

export default ConnectForm
