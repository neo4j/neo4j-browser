import React from 'react'
import { connect } from 'react-redux'
import { CypherFrame } from './CypherFrame'
import { HistoryFrame } from './HistoryFrame'
import { PlayFrame } from './PlayFrame'

const StreamComponent = (props) => {
  const frames = props.frames
  const framesList = frames.map((frame) => {
    if (frame.type === 'cypher') {
      return <CypherFrame key={frame.id} frame={frame} />
    }
    if (frame.type === 'pre') {
      return <div className='frame' key={frame.id}><pre>{frame.contents}</pre></div>
    }
    if (frame.type === 'play' || frame.type === 'play-remote') {
      return <PlayFrame key={frame.id} contents={frame.contents} command={frame.cmd} />
    }
    if (frame.type === 'history') {
      return <HistoryFrame key={frame.id} frame={frame}/>
    }
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

const Stream = connect(mapStateToProps)(StreamComponent)

export {
  Stream,
  StreamComponent
}
