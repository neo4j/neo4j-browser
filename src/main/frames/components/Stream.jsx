import React from 'react'
import { connect } from 'react-redux'
import { FrameTitlebar } from './FrameTitlebar'
import { CypherFrame } from './CypherFrame'
import { HistoryFrame } from './HistoryFrame'
import { PlayFrame } from './PlayFrame'
import { Frame } from './Frame'
import editor from '../../editor'

const StreamComponent = (props) => {
  const frames = props.frames
  const framesList = frames.map((frame) => {
    if (frame.type === 'cypher') {
      return <CypherFrame handleTitlebarClick={props.onTitlebarClick} key={frame.id} frame={frame} />
    }
    if (frame.type === 'pre') {
      return (
        <div className='frame' key={frame.id}>
          <FrameTitlebar handleTitlebarClick={props.onTitlebarClick} frame={frame} />
          <div className='frame-contents'><pre>{frame.contents}</pre></div>
        </div>
      )
    }
    if (frame.type === 'play' || frame.type === 'play-remote') {
      return <PlayFrame handleTitlebarClick={props.onTitlebarClick} key={frame.id} frame={frame} />
    }
    if (frame.type === 'history') {
      return <HistoryFrame handleTitlebarClick={props.onTitlebarClick} key={frame.id} frame={frame}/>
    }
    return <Frame handleTitlebarClick={props.onTitlebarClick} key={frame.id} frame={frame} />
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
    onTitlebarClick: (cmd) => {
      dispatch(editor.actions.setContent(cmd))
    }
  }
}

const Stream = connect(mapStateToProps, mapDispatchToProps)(StreamComponent)

export {
  Stream,
  StreamComponent
}
