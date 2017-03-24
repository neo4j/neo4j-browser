import { Component } from 'preact'

import ConnectionForm from './ConnectionForm'
import FrameTemplate from '../FrameTemplate'
import FrameError from '../FrameError'
import Visible from 'browser-components/Visible'
import {H3} from 'browser-components/headers'
import {
  StyledConnectionForm,
  StyledConnectionFrame,
  StyledConnectionAside,
  StyledConnectionTextInput,
  StyledConnectionLabel,
  StyledConnectionFormEntry
} from './styled'

export class ChangePasswordFrame extends Component {
  constructor (props) {
    super(props)
    const connection = this.props.frame.connectionData
    this.state = {
      ...connection,
      passwordChangeNeeded: false,
      error: {},
      password: '',
      success: false
    }
  }
  error (e) {
    if (e.code === 'N/A') {
      e.message = 'Existing password is incorrect'
    }
    this.setState({error: e})
  }
  onPasswordChange (event) {
    const password = event.target.value
    this.setState({password})
    this.error({})
  }
  onSuccess () {
    this.setState({password: ''})
    this.setState({success: true})
  }
  render () {
    const content = (
      <StyledConnectionFrame>
        <StyledConnectionAside>
          <H3>Password change</H3>
          <Visible if={!this.state.success}>
            Enter your current password and the new twice to change your password.
          </Visible>
          <Visible if={this.state.success}>
            Password change successful
          </Visible>
        </StyledConnectionAside>

        <ConnectionForm {...this.props} error={this.error.bind(this)} oldPassword={this.state.password} onSuccess={this.onSuccess.bind(this)} forcePasswordChange>
          <Visible if={!this.state.success}>
            <StyledConnectionFormEntry>
              <StyledConnectionLabel>Existing password</StyledConnectionLabel>
              <StyledConnectionTextInput type='password' value={this.state.password} onChange={this.onPasswordChange.bind(this)} />
            </StyledConnectionFormEntry>
          </Visible>
        </ConnectionForm>
      </StyledConnectionFrame>
    )
    return (
      <FrameTemplate
        header={this.props.frame}
        statusbar={<FrameError code={this.state.error.code} message={this.state.error.message} />}
        contents={content}
      />
    )
  }
}
export default ChangePasswordFrame
