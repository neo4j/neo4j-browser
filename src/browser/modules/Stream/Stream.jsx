import { connect } from 'preact-redux'
import { StyledStream } from './styled'

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
import SysInfoFrame from './SysInfoFrame'
import ConnectionFrame from './Auth/ConnectionFrame'
import DisconnectFrame from './Auth/DisconnectFrame'
import UserList from '../User/UserList'
import UserAdd from '../User/UserAdd'
import { getFrames } from 'shared/modules/stream/streamDuck'
import { getRequests } from 'shared/modules/requests/requestsDuck'
import { getActiveConnectionData } from 'shared/modules/connections/connectionsDuck'
import QueriesFrame from './Queries/QueriesFrame'

const getFrame = (type) => {
  const trans = {
    error: ErrorFrame,
    cypher: CypherFrame,
    'user-list': UserList,
    'user-add': UserAdd,
    pre: PreFrame,
    play: PlayFrame,
    'play-remote': PlayFrame,
    history: HistoryFrame,
    param: ParamFrame,
    params: ParamsFrame,
    connection: ConnectionFrame,
    disconnect: DisconnectFrame,
    schema: SchemaFrame,
    help: HelpFrame,
    queries: QueriesFrame,
    sysinfo: SysInfoFrame,
    default: Frame
  }
  return trans[type] || trans['default']
}

export const Stream = (props) => {
  return (
    <StyledStream>
      {props.frames.map((frame) => {
        const frameProps = {
          frame,
          activeConnectionData: props.activeConnectionData,
          request: props.requests[frame.requestId]
        }
        const MyFrame = getFrame(frame.type)
        return <MyFrame {...frameProps} key={frame.id} />
      })}
    </StyledStream>
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
