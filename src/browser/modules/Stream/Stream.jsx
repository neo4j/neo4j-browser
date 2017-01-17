import React from 'react'
import { connect } from 'react-redux'
import CypherFrame from './CypherFrame'
import WidgetFrame from './WidgetFrame'
import HistoryFrame from './HistoryFrame'
import PlayFrame from './PlayFrame'
import Frame from './Frame'
import PreFrame from './PreFrame'
import ErrorFrame from './ErrorFrame'
import StyleFrame from './StyleFrame'
import getFrames from '../reducer'

export const Stream = (props) => {
  const {frames} = props
  const framesList = frames.map((frame) => {
    if (frame.type === 'error') {
      return (
        <ErrorFrame
          key={frame.id} frame={frame}
        />
      )
    }
    if (frame.type === 'cypher') {
      return (
        <CypherFrame
          key={frame.id} frame={frame}
        />
      )
    }
    if (frame.type === 'widget') {
      return (
        <WidgetFrame
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
    if (frame.type === 'style') {
      return (
        <StyleFrame
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
    <div id='stream' style={{
      padding: '20px',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div>
        {framesList}
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  return {
    frames: getFrames(state).reverse()
  }
}

export default connect(mapStateToProps)(Stream)
