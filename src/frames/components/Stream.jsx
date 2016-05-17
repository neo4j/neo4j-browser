import React from 'react'
import { connect } from 'react-redux'
import { CypherFrame } from './CypherFrame'
import editor from '../../editor'

const StreamComponent = (props) => {
  const frames = props.frames
  const framesList = frames.map((frame) => {
    if (frame.type === 'cypher') {
      return <CypherFrame key={frame.id} frame={frame} />
    }
    if (frame.type === 'pre') {
      return <div className='frame' key={frame.id}><pre>{frame.contents}</pre></div>
    }
    if (frame.type === 'history') {
      const historyRows = frame.history.map((entry, index) => {
        return <li onClick={() => props.onHistoryClick(entry.cmd)} key={index}>{entry.cmd}</li>
      })
      return <div className='frame' key={frame.id}><ul className='history-list'>{historyRows}</ul></div>
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

const mapDispatchToProps = (dispatch) => {
  return {
    onHistoryClick: (cmd) => {
      dispatch(editor.actions.setContent(cmd))
    }
  }
}

const Stream = connect(mapStateToProps, mapDispatchToProps)(StreamComponent)

export {
  Stream,
  StreamComponent
}
