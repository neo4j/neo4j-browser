import React from 'react'
import { connect } from 'react-redux'

const StreamComponent = ({frames}) => {
  const framesList = frames.map((frame) => {
    const frameContents = frame.result && frame.result.records ? JSON.stringify(frame.result.records) : frame.cmd
    return <div className='frame' key={frame.id}>{frameContents}</div>
  })
  return (
    <div id='stream'>
      {framesList}
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    frames: [].concat(state.frames).reverse()
  }
}

const Stream = connect(mapStateToProps)(StreamComponent)

export {
  Stream,
  StreamComponent
}
