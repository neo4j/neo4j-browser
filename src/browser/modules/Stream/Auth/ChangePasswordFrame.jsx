import { Component } from 'preact'

import ConnectionForm from './ConnectionForm'
import FrameTemplate from '../FrameTemplate'
import FrameError from '../FrameError'
import Visible from 'browser-components/Visible'

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
    this.setState({error: e})
  }
  onPasswordChange (event) {
    const password = event.target.value
    this.setState({password})
    this.error({})
  }
  onSuccess () {
    this.setState({success: true})
  }
  render () {
    const content = (
      <div>
        <Visible if={!this.state.success}>
          <form>
            <ul>
              <li>
                <label>Existing password</label>
                <input onChange={this.onPasswordChange.bind(this)} />
              </li>
            </ul>
          </form>
        </Visible>
        <Visible if={this.state.success}>
          Password change successful
        </Visible>
        <ConnectionForm {...this.props} error={this.error.bind(this)} oldPassword={this.state.password} onSuccess={this.onSuccess.bind(this)} forcePasswordChange />
      </div>
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
