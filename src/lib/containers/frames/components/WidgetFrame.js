import React from 'react'
import { connect } from 'react-redux'
import { FrameTitlebar } from './FrameTitlebar'
import asciitable from 'ascii-data-table'
import widgets from '../../widgets'
//import bolt from '../../../../services/bolt/bolt'

class WidgetFrameComponent extends React.Component {
  constructor (props) {
    super(props)
    console.log(this.props)
    this.state = {
      type: 'text',
      widget: this.props.getWidget(this.props.frame.content)
    }
  }

  componentWillReceiveProps (nextProps) {
  }

  render () {
    const frame = this.props.frame
    const errors = frame.errors && frame.errors.fields || false
    const result = frame.result || false
    console.log(this.props)
    const frameContents = <pre>{asciitable.run(JSON.stringify(result.records, null, 2))}</pre>
    return (
      <div className='frame'>
        <FrameTitlebar frame={frame} />
        <div className='frame-contents'>{frameContents}</div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    getWidget: (name) => widgets.selectors.getWidgetByName(state, name)
  }
}

const WidgetFrame = connect(mapStateToProps)(WidgetFrameComponent)

export {
  WidgetFrame,
  WidgetFrameComponent
}
