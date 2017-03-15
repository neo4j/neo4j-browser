import { Component } from 'preact'
import FrameTemplate from './FrameTemplate'
import { CypherFrameButton } from 'browser-components/buttons'
import FrameSidebar from './FrameSidebar'
import { VisualizationIcon, TableIcon, AsciiIcon, CodeIcon, PlanIcon, AlertIcon } from 'browser-components/icons/Icons'
import QueryPlan from './Planner/QueryPlan'
import TableView from './Views/TableView'
import AsciiView from './Views/AsciiView'
import CodeView from './Views/CodeView'
import WarningsView from './Views/WarningsView'
import bolt from 'services/bolt/bolt'
import Visualization from './Visualization'
import FrameError from './FrameError'

class CypherFrame extends Component {
  constructor (props) {
    super(props)
    this.state = {
      openView: 'visualization'
    }
  }

  onNavClick (viewName) {
    this.setState({openView: viewName})
  }

  componentWillReceiveProps (nextProps) {
    let rows
    let plan
    let nodesAndRelationships
    let warnings
    if (nextProps.request.status === 'success' && nextProps.request.result !== this.props.request.result) {
      if (nextProps.request.result.records && nextProps.request.result.records.length > 0) {
        nodesAndRelationships = bolt.extractNodesAndRelationshipsFromRecords(nextProps.request.result.records)
        rows = bolt.recordsToTableArray(nextProps.request.result.records)
      }

      console.log(nextProps.request)
      plan = bolt.extractPlan(nextProps.request.result)
      warnings = nextProps.request.result.summary ? nextProps.request.result.summary.notifications : null

      if (warnings && warnings.length > 0) {
        this.setState({openView: 'warnings', notifications: warnings, cypher: nextProps.request.result.summary.statement.text})
      } else if (plan) {
        this.setState({openView: 'plan'})
      }
    } else {
      this.setState({nodesAndRelationships, rows, plan})
    }
  }

  sidebar () {
    return (
      <FrameSidebar>
        <CypherFrameButton selected={this.state.openView === 'visualization'} onClick={() => {
          this.setState({openView: 'visualization'})
        }}><VisualizationIcon /></CypherFrameButton>
        <CypherFrameButton selected={this.state.openView === 'table'} onClick={() => {
          this.setState({openView: 'table'})
        }}><TableIcon /></CypherFrameButton>
        <CypherFrameButton selected={this.state.openView === 'text'} onClick={() => {
          this.setState({openView: 'text'})
        }}><AsciiIcon /></CypherFrameButton>
        {
          (this.state.plan || bolt.extractPlan(this.props.request.result || false)
            ? <CypherFrameButton selected={this.state.openView === 'plan'} onClick={() =>
              this.setState({openView: 'plan'})
            }><PlanIcon /></CypherFrameButton>
            : null)
        }
        {
          this.state.plan || bolt.extractPlan(this.props.request.result || false)
            ? <CypherFrameButton selected={this.state.openView === 'plan'} icon={<PlanIcon />} onClick={() =>
            this.setState({openView: 'plan'})
              } />
            : null
        }
        {
          this.state.notifications // props.request.result && this.props.request.result.summary.notifications.length > 0)
           ? <CypherFrameButton selected={this.state.openView === 'warnings'} icon={<AlertIcon />} onClick={() => {
             this.setState({openView: 'warnings'})
           }} />
            : null
        }
        <CypherFrameButton selected={this.state.openView === 'code'} onClick={() => {
          this.setState({openView: 'code'})
        }}><CodeIcon /></CypherFrameButton>
      </FrameSidebar>
    )
  }

  render () {
    const frame = this.props.frame
    const errors = this.props.request.status === 'error' ? this.props.request.result : false
    const result = this.props.request.result || false
    const plan = this.state.plan || bolt.extractPlan(result)
    const requestStatus = this.props.request.status

    let frameContents = <pre>{JSON.stringify(result, null, 2)}</pre>
    let statusBar = null

    if ((result.records) || plan) {
      if (result.records && result.records.length > 0) {
        this.state.rows = this.state.rows || bolt.recordsToTableArray(result.records)
      }

      switch (this.state.openView) {
        case 'text':
          frameContents = <AsciiView rows={this.state.rows} />
          break
        case 'table':
          frameContents = <TableView data={this.state.rows} />
          break
        case 'visualization':
          frameContents = <Visualization records={result.records} />
          break
        case 'code':
          frameContents = <CodeView query={this.props.frame.cmd} request={this.props.request} />
          break
        case 'plan':
          frameContents = <QueryPlan plan={plan} />
          break
        case 'warnings':
          frameContents = <WarningsView notifications={this.state.notifications} cypher={this.state.cypher} />
          break
        default:
          frameContents = <Visualization records={result.records} />
      }
    } else if (errors) {
      frameContents = (
        <div>
          {errors.code}
          <pre>{errors.message}</pre>
        </div>
      )
      statusBar = <FrameError code={errors.code} />
    } else if (result) {
      frameContents = (
        <div>
          <pre>{JSON.stringify(result, null, '\t')}</pre>
        </div>
      )
    } else if (requestStatus === 'pending') {
      frameContents = (
        <div>
          Running query...
        </div>
      )
    }
    return (
      <FrameTemplate
        sidebar={this.sidebar.bind(this)}
        header={frame}
        contents={frameContents}
        statusbar={statusBar}
      />
    )
  }
}
export default CypherFrame
