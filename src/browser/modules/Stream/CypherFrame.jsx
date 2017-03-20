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
import * as viewTypes from 'shared/modules/stream/frameViewTypes'

class CypherFrame extends Component {
  constructor (props) {
    super(props)
    this.state = {
      openView: 'visualization',
      plan: null,
      notifications: null
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

      plan = bolt.extractPlan(nextProps.request.result)
      warnings = nextProps.request.result.summary ? nextProps.request.result.summary.notifications : null

      this.decideOpeningView({plan, nodesAndRelationships, warnings, props: nextProps})

      if (warnings && warnings.length > 0) {
        this.setState({notifications: warnings, cypher: nextProps.request.result.summary.statement.text})
      }
    }

    this.setState({nodesAndRelationships, rows, plan})
  }

  decideOpeningView ({plan, nodesAndRelationships, warnings, props}) {
    if (props.frame.forceView) {
      this.setState({openView: props.frame.forceView})
    } else if (plan) {
      this.setState({openView: viewTypes.PLAN})
    } else {
      let view = props.recentView || viewTypes.VISUALIZATION
      this.setState({openView: this.returnRecentViewOrFallback({view, plan, nodesAndRelationships, warnings, props})})
    }
  }

  returnRecentViewOrFallback ({view, plan, nodesAndRelationships, warnings, props}) {
    switch (view) {
      case viewTypes.PLAN :
        return plan != null
          ? viewTypes.PLAN
          : this.returnRecentViewOrFallback({view: viewTypes.VISUALIZATION, plan, nodesAndRelationships, warnings, props})
      case viewTypes.WARNINGS :
        return (warnings != null && warnings.length > 0)
          ? viewTypes.WARNINGS
          : this.returnRecentViewOrFallback({view: viewTypes.VISUALIZATION, plan, nodesAndRelationships, warnings, props})
      case viewTypes.VISUALIZATION :
        return (nodesAndRelationships && nodesAndRelationships.nodes.length > 0)
            ? viewTypes.VISUALIZATION
            : viewTypes.TABLE
      default:
        return view
    }
  }

  changeView (view) {
    this.setState({openView: view})

    if (this.props.onRecentViewChanged) {
      this.props.onRecentViewChanged(view)
    }
  }

  sidebar () {
    return (
      <FrameSidebar>
        <CypherFrameButton selected={this.state.openView === viewTypes.VISUALIZATION} onClick={() => {
          this.changeView(viewTypes.VISUALIZATION)
        }}><VisualizationIcon /></CypherFrameButton>
        <CypherFrameButton selected={this.state.openView === viewTypes.TABLE} onClick={() => {
          this.changeView(viewTypes.TABLE)
        }}><TableIcon /></CypherFrameButton>
        <CypherFrameButton selected={this.state.openView === viewTypes.TEXT} onClick={() => {
          this.changeView(viewTypes.TEXT)
        }}><AsciiIcon /></CypherFrameButton>
        {
          this.state.plan || bolt.extractPlan(this.props.request.result || false)
            ? <CypherFrameButton selected={this.state.openView === viewTypes.PLAN} onClick={() =>
              this.changeView(viewTypes.PLAN)
            }><PlanIcon /></CypherFrameButton>
            : null
        }
        {
          this.state.notifications
            ? <CypherFrameButton selected={this.state.openView === viewTypes.WARNINGS} onClick={() => {
              this.changeView(viewTypes.WARNINGS)
            }}><AlertIcon /></CypherFrameButton>
            : null
        }
        <CypherFrameButton selected={this.state.openView === viewTypes.CODE} onClick={() => {
          this.changeView(viewTypes.CODE)
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

    if (errors) {
      frameContents = (
        <div>
          {errors.code}
          <pre>{errors.message}</pre>
        </div>
      )
      statusBar = <FrameError code={errors.code} />
    } else if ((result.records) || plan) {
      if (result.records && result.records.length > 0) {
        this.state.rows = this.state.rows || bolt.recordsToTableArray(result.records)
      }

      switch (this.state.openView) {
        case viewTypes.TEXT:
          frameContents = <AsciiView rows={this.state.rows} />
          break
        case viewTypes.TABLE:
          frameContents = <TableView data={this.state.rows} />
          break
        case viewTypes.VISUALIZATION:
          frameContents = <Visualization records={result.records} />
          break
        case viewTypes.CODE:
          frameContents = <CodeView query={this.props.frame.cmd} request={this.props.request} />
          break
        case viewTypes.PLAN:
          frameContents = <QueryPlan plan={plan} />
          break
        case viewTypes.WARNINGS:
          frameContents = <WarningsView notifications={this.state.notifications} cypher={this.state.cypher} />
          break
        default:
          frameContents = <Visualization records={result.records} />
      }
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
