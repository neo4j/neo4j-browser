import React from 'react'
import { connect } from 'react-redux'
import { CypherFrame } from './CypherFrame'

const StreamComponent = ({frames}) => {
  const framesList = frames.map((frame) => {
    if (frame.type === 'cypher') {
      return <CypherFrame key={frame.id} frame={frame} />
    }
    const frameContents = frame.cmd
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
