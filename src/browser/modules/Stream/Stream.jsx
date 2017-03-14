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
import SysInfoFrame from './SysInfoFrame'
import ConnectionFrame from './Auth/ConnectionFrame'
import DisconnectFrame from './Auth/DisconnectFrame'
import UserList from '../User/UserList'
import UserAdd from '../User/UserAdd'
import { getFrames } from 'shared/modules/stream/streamDuck'
import { getRequests } from 'shared/modules/requests/requestsDuck'
import { getActiveConnectionData } from 'shared/modules/connections/connectionsDuck'
import QueriesFrame from './Queries/QueriesFrame'

const getFrame = (type, id, props) => {
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
  const MyFrame = trans[type] || trans['default']
  return <MyFrame {...props} key={id} />
}

export const Stream = (props) => {
  const {frames} = props
  const framesList = frames.map((frame) => {
    const frameProps = {
      frame,
      activeConnectionData: props.activeConnectionData,
      request: props.requests[frame.requestId]
    }
    return getFrame(frame.type, frame.id, frameProps)
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
