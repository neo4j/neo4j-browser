import { Component } from 'preact'

import FrameTemplate from '../FrameTemplate'
import ConnectionForm from './ConnectionForm'
import FrameError from '../FrameError'

export class ConnectionFrame extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: {}
    }
  }
  error (e) {
    this.setState({error: e})
  }
  render () {
    return (
      <FrameTemplate
        header={this.props.frame}
        statusbar={<FrameError code={this.state.error.code} message={this.state.error.message} />}
        contents={<ConnectionForm {...this.props} error={this.error.bind(this)} />}
      />
    )
  }
}

export default ConnectionFrame
