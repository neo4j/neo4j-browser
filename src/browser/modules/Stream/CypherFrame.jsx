/*
 * Copyright (c) 2002-2017 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
import Visible from 'browser-components/Visible'
import * as viewTypes from 'shared/modules/stream/frameViewTypes'
import { StyledFrameBody } from './styled'

class CypherFrame extends Component {
  constructor (props) {
    super(props)
    this.state = {
      openView: viewTypes.VISUALIZATION,
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

  resultHasNodes () {
    return (this.state.nodesAndRelationships) ? (this.state.nodesAndRelationships.nodes && this.state.nodesAndRelationships.nodes.length > 0) : false
  }

  sidebar () {
    return (
      <FrameSidebar>
        <Visible if={this.resultHasNodes()}>
          <CypherFrameButton selected={this.state.openView === viewTypes.VISUALIZATION} onClick={() => {
            this.changeView(viewTypes.VISUALIZATION)
          }}><VisualizationIcon /></CypherFrameButton>
        </Visible>
        <CypherFrameButton selected={this.state.openView === viewTypes.TABLE} onClick={() => {
          this.changeView(viewTypes.TABLE)
        }}><TableIcon /></CypherFrameButton>
        <CypherFrameButton selected={this.state.openView === viewTypes.TEXT} onClick={() => {
          this.changeView(viewTypes.TEXT)
        }}><AsciiIcon /></CypherFrameButton>
        <Visible if={this.state.plan || bolt.extractPlan(this.props.request.result || false)}>
          <CypherFrameButton selected={this.state.openView === viewTypes.PLAN} onClick={() =>
            this.changeView(viewTypes.PLAN)
          }><PlanIcon /></CypherFrameButton>
        </Visible>
        <Visible if={this.state.notifications}>
          <CypherFrameButton selected={this.state.openView === viewTypes.WARNINGS} onClick={() => {
            this.changeView(viewTypes.WARNINGS)
          }}><AlertIcon /></CypherFrameButton>
        </Visible>
        <CypherFrameButton selected={this.state.openView === viewTypes.CODE} onClick={() => {
          this.changeView(viewTypes.CODE)
        }}><CodeIcon /></CypherFrameButton>
      </FrameSidebar>
    )
  }

  getDisplayStyle (viewType) {
    return this.state.openView === viewType ? {display: 'block'} : {display: 'none'}
  }

  onResize (fullscreen, collapse, frameHeight) {
    if (frameHeight) {
      this.setState({fullscreen, collapse, frameHeight})
    } else {
      this.setState({fullscreen, collapse})
    }
  }

  render () {
    const frame = this.props.frame
    const errors = this.props.request.status === 'error' ? this.props.request.result : false
    const result = this.props.request.result || false
    const plan = this.state.plan || bolt.extractPlan(result)
    const requestStatus = this.props.request.status

    let frameContents = <pre>{JSON.stringify(result, null, 2)}</pre>
    let statusBar = null
    let rows

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
        rows = bolt.recordsToTableArray(result.records)
      }
      frameContents =
        <StyledFrameBody fullscreen={this.state.fullscreen} collapsed={this.state.collapse}>
          <AsciiView style={this.getDisplayStyle(viewTypes.TEXT)} rows={rows} />
          <TableView style={this.getDisplayStyle(viewTypes.TABLE)} data={rows} />
          <Visualization style={this.getDisplayStyle(viewTypes.VISUALIZATION)} records={result.records} fullscreen={this.state.fullscreen} frameHeight={this.state.frameHeight} />
          <CodeView style={this.getDisplayStyle(viewTypes.CODE)} query={this.props.frame.cmd} request={this.props.request} />
          <QueryPlan style={this.getDisplayStyle(viewTypes.PLAN)} plan={plan} />
          <WarningsView style={this.getDisplayStyle(viewTypes.WARNINGS)} notifications={this.state.notifications} cypher={this.state.cypher} />
        </StyledFrameBody>
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
        exportData={this.state.rows}
        statusbar={statusBar}
        onResize={this.onResize.bind(this)}
      />
    )
  }
}

export default CypherFrame
