import React from 'react'
import { connect } from 'react-redux'
import { FrameTitlebar } from './FrameTitlebar'
import { CypherFrame } from './CypherFrame'
import { HistoryFrame } from './HistoryFrame'
import { PlayFrame } from './PlayFrame'
import { Frame } from './Frame'
import editor from '../../editor'
import { getAvailableFrameTypes, getVisibleFrames } from '../reducer'
import { toggleVisibleFilter } from '../actions'
import classNames from 'classnames'

const StreamComponent = (props) => {
  const {frames, onTitlebarClick} = props
  const framesList = frames.map((frame) => {
    if (frame.type === 'cypher') {
      return <CypherFrame handleTitlebarClick={onTitlebarClick} key={frame.id} frame={frame} />
    }
    if (frame.type === 'pre') {
      return (
        <div className='frame' key={frame.id}>
          <FrameTitlebar handleTitlebarClick={onTitlebarClick} frame={frame} />
          <div className='frame-contents'><pre>{frame.contents}</pre></div>
        </div>
      )
    }
    if (frame.type === 'play' || frame.type === 'play-remote') {
      return <PlayFrame handleTitlebarClick={onTitlebarClick} key={frame.id} frame={frame} />
    }
    if (frame.type === 'history') {
      return <HistoryFrame handleTitlebarClick={onTitlebarClick} key={frame.id} frame={frame}/>
    }
    return <Frame handleTitlebarClick={onTitlebarClick} key={frame.id} frame={frame} />
  })
  const frameTypes = props.frameTypes || []
  const types = frameTypes.map((type) => {
    const buttonClassNames = classNames({
      'checkbox-button': true,
      checked: props.visibleFilter.indexOf(type) > -1
    })
    return (
      <label className={buttonClassNames} key={type}>
        <input type='checkbox' name={type} value={type} onClick={() => props.onTypeClick(type)} />
        {type.toUpperCase()}
      </label>
    )
  })
  const typeListStyle = classNames({
    hidden: !frameTypes.length,
    'stream-filter': true
  })
  return (
    <div id='stream'>
      <div className={typeListStyle}>
        Stream frame filter: {types}
      </div>
      <div>
        {framesList}
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    frames: getVisibleFrames(state).reverse(),
    frameTypes: getAvailableFrameTypes(state),
    visibleFilter: state.frames.visibleFilter
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onTitlebarClick: (cmd) => {
      dispatch(editor.actions.setContent(cmd))
    },
    onTypeClick: (type) => {
      dispatch(toggleVisibleFilter(type))
    }
  }
}

const Stream = connect(mapStateToProps, mapDispatchToProps)(StreamComponent)

export {
  Stream,
  StreamComponent
}
