import React from 'react'
import { connect } from 'react-redux'

const StreamComponent = ({frames}) => {
  const framesList = frames.map((frame) => {
    return <div className='frame' key={frame.id}>{frame.cmd}</div>
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

export default connect(mapStateToProps)(StreamComponent)
