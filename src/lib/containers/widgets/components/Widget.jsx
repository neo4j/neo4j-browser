import React from 'react'
import { connect } from 'react-redux'
import asciitable from 'ascii-data-table'
import * as selectors from '../reducer'

class Widget extends React.Component {
  constructor (props) {
    super(props)
    console.log(this.props)
    this.state = {
      type: 'text'
    }
  }

  componentWillReceiveProps (nextProps) {
  }

  render () {
    const widget = this.props.getWidget(this.props.frame.content)
    const frame = this.props.frame
    const frameContents = (
      <pre>{
        asciitable.run([
          ['widget', 'latest result'],
          [JSON.stringify(widget, null, 2), widget.history.pop()]
        ])
      }</pre>
  )
    return (
      <div className='widget'>
        <div className='frame-contents'>{frameContents}</div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    getWidget: (name) => selectors.getWidgetByName(state, name)
  }
}

export default connect(mapStateToProps)(Widget)

export {
  Widget
}
