import React from 'react'
import { connect } from 'react-redux'
import { updateConnection } from 'shared/modules/connections/connectionsDuck'

import FrameTemplate from './FrameTemplate'
import Form from 'grommet/components/Form'
import FormField from 'grommet/components/FormField'
import FormFields from 'grommet/components/FormFields'
import Footer from 'grommet/components/Footer'
import Button from 'grommet/components/Button'
import TextInput from 'grommet/components/TextInput'
import Notification from 'grommet/components/Notification'

export class ConnectionFrame extends React.Component {
  constructor (props) {
    super(props)
    this.frameInfo = this.props.frame
    this.state = {
      connectionId: this.frameInfo.connectionData.id,
      connectionName: this.frameInfo.connectionData.name,
      username: this.frameInfo.connectionData.username,
      password: this.frameInfo.connectionData.password
    }
  }
  onUsernameChange (event) {
    const username = event.target.value
    this.setState({username})
  }
  onPasswordChange (event) {
    const password = event.target.value
    this.setState({password})
  }
  frameContents () {
    const notification =
      (this.state.updated)
      ? <Notification message='Connection details updated' status='ok' closer onClose={() => {
        this.setState({updated: false})
      }} />
      : null

    return (
      <div>
        We have created a connection called "{this.state.connectionName}" to {this.frameInfo.connectionData.host}
        <Form>
          <FormFields>
            <FormField label='Username'>
              <TextInput onDOMChange={this.onUsernameChange.bind(this)} defaultValue={this.state.username} />
            </FormField>
            <FormField label='Password'>
              <TextInput type='password' onDOMChange={this.onPasswordChange.bind(this)} defaultValue={this.state.password} />
            </FormField>
          </FormFields>
        </Form>
        <Footer>
          <Button label='Submit' type='submit' primary onClick={() => {
            this.setState({updated: true})
            this.props.updateConnection({
              id: this.state.connectionId,
              name: this.state.connectionName,
              username: this.state.username,
              password: this.state.password
            })
          }} />
        </Footer>
        {notification}
      </div>
    )
  }
  render () {
    return (
      <FrameTemplate
        header={this.frameInfo}
        contents={this.frameContents()}
      />
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateConnection: (connection) => {
      dispatch(updateConnection(connection))
    }
  }
}
const ConnectedConnectionFrame = connect(null, mapDispatchToProps)(ConnectionFrame)
export default ConnectedConnectionFrame
