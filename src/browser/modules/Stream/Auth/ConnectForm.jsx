import React from 'react'

import Form from 'grommet/components/Form'
import FormField from 'grommet/components/FormField'
import FormFields from 'grommet/components/FormFields'
import Footer from 'grommet/components/Footer'
import {FormButton} from 'nbnmui/buttons'
import TextInput from 'grommet/components/TextInput'

const ConnectForm = (props) => (
  <div>
    <Form>
      <FormFields>
        <FormField label='Host'>
          <TextInput onDOMChange={props.onHostChange} value={props.host} />
        </FormField>
        <FormField label='Username'>
          <TextInput onDOMChange={props.onUsernameChange} value={props.username} />
        </FormField>
        <FormField label='Password'>
          <TextInput type='password' onDOMChange={props.onPasswordChange} value={props.password} />
        </FormField>
      </FormFields>
    </Form>
    <Footer>
      <FormButton onClick={props.onConnectClick}>Connect</FormButton>
    </Footer>
  </div>
)

export default ConnectForm
