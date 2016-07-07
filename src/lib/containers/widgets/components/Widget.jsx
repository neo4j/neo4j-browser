import React from 'react'
import { connect } from 'react-redux'
import asciitable from 'ascii-data-table'
import * as selectors from '../reducer'

const Widget = (props) => {

  const widget = props.getWidget(props.frame.content)
  const frame = props.frame
  const latest = widget.history[widget.history.length-1]
  const res = !latest || typeof latest === 'string' ? latest : latest.records[0].get(0)
  const frameContents = (
    <pre>{
      asciitable.run([
        ['widget', 'latest result'],
        [widget.name, res]
      ])
    }</pre>
  )
  return (
    <div className='widget'>
      <div className='frame-contents'>{frameContents}</div>
    </div>
  )
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
