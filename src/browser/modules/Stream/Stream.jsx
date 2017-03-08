import { connect } from 'react-redux'
import CypherFrame from './CypherFrame'
import HistoryFrame from './HistoryFrame'
import PlayFrame from './PlayFrame'
import Frame from './Frame'
import PreFrame from './PreFrame'
import ParamsFrame from './ParamsFrame'
import ParamFrame from './ParamFrame'
import ErrorFrame from './ErrorFrame'
import HelpFrame from './HelpFrame'
import SchemaFrame from './SchemaFrame'
import ConnectionFrame from './Auth/ConnectionFrame'
import DisconnectFrame from './Auth/DisconnectFrame'
import UserList from '../User/UserList'
import UserAdd from '../User/UserAdd'
import { getFrames } from 'shared/modules/stream/streamDuck'
import { getRequests } from 'shared/modules/requests/requestsDuck'
import { getActiveConnectionData } from 'shared/modules/connections/connectionsDuck'

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
      case 'user-list':
        return (
          <UserList
            key={frame.id} frame={frame}
          />
        )
      case 'user-add':
        return (
          <UserAdd
            key={frame.id} frame={frame}
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
      case 'param':
        return (
          <ParamFrame
            key={frame.id}
            frame={frame}
          />
        )
      case 'params':
        return (
          <ParamsFrame
            key={frame.id}
            frame={frame}
          />
        )
      case 'connection':
        return (
          <ConnectionFrame
            key={frame.id}
            frame={frame}
          />
        )
      case 'disconnect':
        return (
          <DisconnectFrame
            key={frame.id}
            frame={frame}
            activeConnectionData={props.activeConnectionData}
          />
        )
      case 'help':
        return (
          <HelpFrame
            key={frame.id}
            frame={frame}
          />
      case 'schema':
        return (
          <SchemaFrame
            key={frame.id}
            frame={frame}
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
    requests: getRequests(state),
    activeConnectionData: getActiveConnectionData(state)
  }
}

export default connect(mapStateToProps)(Stream)
