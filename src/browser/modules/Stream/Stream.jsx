import React from 'react'
import { connect } from 'react-redux'
import CypherFrame from './CypherFrame'
import HistoryFrame from './HistoryFrame'
import PlayFrame from './PlayFrame'
import Frame from './Frame'
import PreFrame from './PreFrame'
import ErrorFrame from './ErrorFrame'
import ConnectedConnectionFrame from './ConnectionFrame'
import { getFrames } from 'shared/modules/stream/streamDuck'
import { getRequests } from 'shared/modules/requests/requestsDuck'

export const Stream = (props) => {
  const {frames} = props
  const framesList = frames.map((frame) => {
    switch (frame.type) {
      case 'error':
        return (
          <ErrorFrame
            key={frame.id} frame={frame}
          />
        )
      case 'cypher':
        return (
          <CypherFrame
            key={frame.id}
            frame={frame}
            request={props.requests[frame.requestId]}
          />
        )
      case 'pre':
        return (
          <PreFrame
            key={frame.id} frame={frame}
          />
        )
      case 'play':
      case 'play-remote':
        return (
          <PlayFrame
            key={frame.id} frame={frame}
          />
        )
      case 'history':
        return (
          <HistoryFrame
            key={frame.id} frame={frame}
          />
        )
      case 'connection':
        return (
          <ConnectedConnectionFrame
            key={frame.id} frame={frame}
          />
        )
      default:
        return (
          <Frame
            key={frame.id} frame={frame}
          />
        )
    }
  })
  return (
    <div id='stream' style={{
      padding: '20px',
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
    frames: getFrames(state),
    requests: getRequests(state)
  }
}

export default connect(mapStateToProps)(Stream)
