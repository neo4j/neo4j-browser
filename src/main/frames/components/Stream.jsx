import React from 'react'
import { connect } from 'react-redux'
import { CypherFrame } from './CypherFrame'
import { HistoryFrame } from './HistoryFrame'
import { PlayFrame } from './PlayFrame'
import { Frame } from './Frame'
import { PreFrame } from './PreFrame'
import { getAvailableFrameTypes, getVisibleFrames, getFramesInContext } from '../reducer'
import { toggleVisibleFilter } from '../actions'
import classNames from 'classnames'
import settings from '../../../settings'

const StreamComponent = (props) => {
  const {frames} = props
  const framesList = frames.map((frame) => {
    if (frame.type === 'cypher') {
      return (
        <CypherFrame
          key={frame.id} frame={frame}
        />
      )
    }
    if (frame.type === 'pre') {
      return (
        <PreFrame
          key={frame.id} frame={frame}
        />
      )
    }
    if (frame.type === 'play' || frame.type === 'play-remote') {
      return (
        <PlayFrame
          key={frame.id} frame={frame}
        />
      )
    }
    if (frame.type === 'history') {
      return (
        <HistoryFrame
          key={frame.id} frame={frame}
        />
      )
    }
    return (
      <Frame
        key={frame.id} frame={frame}
      />
    )
  })
  return (
    <div id='stream'>
      <div>
        {framesList}
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    frames: getFramesInContext(state, settings.selectors.getActiveBookmark(state)).reverse(),
  }
}

const Stream = connect(mapStateToProps)(StreamComponent)

export {
  Stream,
  StreamComponent
}
