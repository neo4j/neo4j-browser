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
import { CypherFrameButton, FrameButton } from 'browser-components/buttons'
import Centered from 'browser-components/Centered'
import FrameSidebar from './FrameSidebar'
import { VisualizationIcon, TableIcon, AsciiIcon, CodeIcon, PlanIcon, AlertIcon, ErrorIcon, DoubleUpIcon, DoubleDownIcon, Spinner } from 'browser-components/icons/Icons'
import QueryPlan from './Planner/QueryPlan'
import TableView from './Views/TableView'
import AsciiView, { AsciiStatusbar } from './Views/AsciiView'
import CodeView from './Views/CodeView'
import WarningsView from './Views/WarningsView'
import ErrorsView from './Views/ErrorsView'
import bolt from 'services/bolt/bolt'
import Visualization from './Visualization'
import FrameError from './FrameError'
import Render from 'browser-components/Render'
import Ellipsis from 'browser-components/Ellipsis'
import * as viewTypes from 'shared/modules/stream/frameViewTypes'
import { StyledFrameBody, StyledStatsBar, SpinnerContainer, FrameTitlebarButtonSection, StyledStatsBarContainer } from './styled'

class CypherFrame extends Component {
  constructor (props) {
    super(props)
    this.state = {
      openView: viewTypes.VISUALIZATION,
      plan: null,
      notifications: null,
      errors: null,
      maxColWidth: 70,
      planAction: null,
      recentViewApplied: false
    }
  }

  onNavClick (viewName) {
    this.setState({openView: viewName})
  }
  getRecordsToDisplay (records) {
    return records.length > this.props.maxRows ? records.slice(0, this.props.maxRows) : records
  }
  getRecordsToVisualise (records) {
    return records.length > this.props.initialNodeDisplay ? records.slice(0, this.props.initialNodeDisplay) : records
  }
  componentWillReceiveProps (nextProps) {
    let rows
    let serializedPropertiesRows
    let plan
    let nodesAndRelationships
    let warnings
    let errors
    if (nextProps.request.status === 'success') {
      if (nextProps.request.result.records && nextProps.request.result.records.length > 0) {
        nodesAndRelationships = bolt.extractNodesAndRelationshipsFromRecordsForOldVis(this.getRecordsToVisualise(nextProps.request.result.records))
        rows = bolt.recordsToTableArray(this.getRecordsToDisplay(nextProps.request.result.records))
        const untransformedRows = bolt.recordsToTableArray(this.getRecordsToDisplay(nextProps.request.result.records), false)
        serializedPropertiesRows = bolt.stringifyRows(untransformedRows)
      }
      plan = bolt.extractPlan(nextProps.request.result, true)
      warnings = nextProps.request.result.summary ? nextProps.request.result.summary.notifications : null

      this.decideOpeningView({plan, nodesAndRelationships, warnings, props: nextProps})
      if (warnings && warnings.length > 0) {
        this.setState({notifications: warnings, cypher: nextProps.request.result.summary.statement.text})
      }
      this.setState({nodesAndRelationships, serializedPropertiesRows, rows, plan, errors})
    } else if (nextProps.request.status !== 'success' && nextProps.request.status !== 'pending') { // Failed query
      errors = nextProps.request.result
      this.setState({ errors: errors, openView: viewTypes.ERRORS })
    }
  }
  componentWillMount () {
    if (this.props.request.status === 'error') {
      this.setState({ errors: this.props.request.result, openView: viewTypes.ERRORS })
    }
  }
  shouldComponentUpdate (nextProps, state) {
    return state.openView !== this.state.openView ||
      state.fullscreen !== this.state.fullscreen ||
      state.frameHeight !== this.state.frameHeight ||
      nextProps.request.result !== this.props.request.result ||
      state.maxColWidth !== this.state.maxColWidth ||
      state.planAction !== this.state.planAction
  }
  setMaxColWidth (w) {
    this.setState({ maxColWidth: w })
  }
  decideOpeningView ({plan, nodesAndRelationships, warnings, props}) {
    if (this.state.recentViewApplied) {
      return
    }
    if (props.frame.forceView) {
      this.setState({openView: props.frame.forceView, recentViewApplied: true})
    } else if (plan) {
      this.setState({openView: viewTypes.PLAN, recentViewApplied: true})
    } else {
      let view = props.recentView || viewTypes.VISUALIZATION
      this.setState({openView: this.returnRecentViewOrFallback({view, plan, nodesAndRelationships, warnings, props}), recentViewApplied: true})
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

  resultHasRows () {
    return this.state.rows && this.state.rows.length > 0
  }

  sidebar () {
    return (
      <FrameSidebar>
        <Render if={this.resultHasNodes() && !this.state.errors}>
          <CypherFrameButton selected={this.state.openView === viewTypes.VISUALIZATION} onClick={() => {
            this.changeView(viewTypes.VISUALIZATION)
          }}><VisualizationIcon /></CypherFrameButton>
        </Render>
        <Render if={!this.state.errors}>
          <CypherFrameButton selected={this.state.openView === viewTypes.TABLE} onClick={() => {
            this.changeView(viewTypes.TABLE)
          }}><TableIcon /></CypherFrameButton>
        </Render>
        <Render if={this.resultHasRows() && !this.state.errors}>
          <CypherFrameButton selected={this.state.openView === viewTypes.TEXT} onClick={() => {
            this.changeView(viewTypes.TEXT)
          }}><AsciiIcon /></CypherFrameButton>
        </Render>
        <Render if={(this.state.plan || bolt.extractPlan(this.props.request.result || false, true)) && !this.state.errors}>
          <CypherFrameButton selected={this.state.openView === viewTypes.PLAN} onClick={() =>
            this.changeView(viewTypes.PLAN)
          }><PlanIcon /></CypherFrameButton>
        </Render>
        <Render if={this.state.notifications && !this.state.errors}>
          <CypherFrameButton selected={this.state.openView === viewTypes.WARNINGS} onClick={() => {
            this.changeView(viewTypes.WARNINGS)
          }}><AlertIcon /></CypherFrameButton>
        </Render>
        <Render if={this.state.errors}>
          <CypherFrameButton selected={this.state.openView === viewTypes.ERRORS} onClick={() => {
            this.changeView(viewTypes.ERRORS)
          }}><ErrorIcon /></CypherFrameButton>
        </Render>
        <Render if={!this.state.errors}>
          <CypherFrameButton selected={this.state.openView === viewTypes.CODE} onClick={() => {
            this.changeView(viewTypes.CODE)
          }}><CodeIcon /></CypherFrameButton>
        </Render>
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

  getBodyAndStatusBarMessages (result) {
    if (!result || !result.summary || !result.summary.resultAvailableAfter) {
      return null
    }

    const resultAvailableAfter = (result.summary.resultAvailableAfter.toNumber() === 0) ? 'in less than 1' : 'after ' + result.summary.resultAvailableAfter.toString()
    const totalTime = result.summary.resultAvailableAfter.add(result.summary.resultConsumedAfter)
    const totalTimeString = (totalTime.toNumber() === 0) ? 'in less than 1' : 'after ' + totalTime.toString()
    const streamMessageTail = result.records.length > this.props.maxRows ? `ms, displaying first ${this.props.maxRows} rows.` : ' ms.'

    let updateMessages = bolt.retrieveFormattedUpdateStatistics(result)
    let streamMessage = result.records.length > 0
      ? `started streaming ${result.records.length} records ${resultAvailableAfter} ms and completed ${totalTimeString} ${streamMessageTail}`
      : `completed ${totalTimeString} ${streamMessageTail}`

    if (updateMessages && updateMessages.length > 0) {
      updateMessages = updateMessages[0].toUpperCase() + updateMessages.slice(1) + ', '
    } else {
      streamMessage = streamMessage[0].toUpperCase() + streamMessage.slice(1)
    }

    const bodyMessage = (updateMessages.length === 0 && result.records.length === 0) ? '(no changes, no records)'
      : updateMessages + `completed ${totalTimeString} ms.`

    return { statusBarMessage: updateMessages + streamMessage, bodyMessage }
  }
  render () {
    const frame = this.props.frame
    const result = this.props.request.result || false
    const plan = this.state.plan || bolt.extractPlan(result, true)
    const requestStatus = this.props.request.status

    let frameContents = <pre>{JSON.stringify(result, null, 2)}</pre>
    let statusBar = null
    let messages

    if (this.state.errors) {
      statusBar = <FrameError code={this.state.errors.code} />
    } else if (result.records || plan) {
      if (this.state.openView !== viewTypes.VISUALIZATION) {
        messages = this.getBodyAndStatusBarMessages(result)
        statusBar = (
          <StyledStatsBar>
            <Ellipsis>
              { messages && messages.statusBarMessage }
            </Ellipsis>
          </StyledStatsBar>
        )
      }
      if (plan && this.state.openView === viewTypes.PLAN) {
        statusBar = (
          <StyledStatsBarContainer>
            <StyledStatsBar>
              <Ellipsis>
                Cypher version: {plan.root.version}, planner: {plan.root.planner}, runtime: {plan.root.runtime}.
                { plan.root.totalDbHits ? ` ${plan.root.totalDbHits} total db hits in ${result.summary.resultAvailableAfter.add(result.summary.resultConsumedAfter).toNumber() || 0} ms.` : ``}
              </Ellipsis>
            </StyledStatsBar>
            <FrameTitlebarButtonSection>
              <FrameButton onClick={() => this.setState({planAction: 'COLLAPSE'})}><DoubleUpIcon /></FrameButton>
              <FrameButton onClick={() => this.setState({planAction: 'EXPAND'})}><DoubleDownIcon /></FrameButton>
            </FrameTitlebarButtonSection>
          </StyledStatsBarContainer>
        )
      }
    }
    if (this.state.openView === viewTypes.TEXT && this.state.serializedPropertiesRows && this.state.serializedPropertiesRows.length) {
      statusBar = (
        <AsciiStatusbar
          rows={this.state.serializedPropertiesRows}
          onInput={this.setMaxColWidth.bind(this)}
        />
      )
    }
    if (requestStatus !== 'pending') {
      frameContents =
        <StyledFrameBody fullscreen={this.state.fullscreen} collapsed={this.state.collapse}>
          <Render if={!this.state.errors}>
            <Visualization style={this.getDisplayStyle(viewTypes.VISUALIZATION)} records={result.records} fullscreen={this.state.fullscreen} frameHeight={this.state.frameHeight} assignVisElement={(svgElement, graphElement) => { this.visElement = {svgElement, graphElement} }} />
          </Render>
          <Render if={!this.state.errors}>
            <TableView style={this.getDisplayStyle(viewTypes.TABLE)} data={this.state.rows} message={messages && messages.bodyMessage} />
          </Render>
          <Render if={!this.state.errors}>
            <AsciiView maxColWidth={this.state.maxColWidth} style={this.getDisplayStyle(viewTypes.TEXT)} rows={this.state.serializedPropertiesRows} message={messages && messages.bodyMessage} />
          </Render>
          <Render if={!this.state.errors}>
            <QueryPlan fullscreen={this.state.fullscreen} style={this.getDisplayStyle(viewTypes.PLAN)} plan={plan} action={this.state.planAction} />
          </Render>
          <Render if={!this.state.errors}>
            <WarningsView style={this.getDisplayStyle(viewTypes.WARNINGS)} notifications={this.state.notifications} cypher={this.state.cypher} />
          </Render>
          <Render if={!this.state.errors}>
            <CodeView style={this.getDisplayStyle(viewTypes.CODE)} query={this.props.frame.cmd} request={this.props.request} />
          </Render>
          <Render if={this.state.errors}>
            <ErrorsView style={this.getDisplayStyle(viewTypes.ERRORS)} error={this.state.errors} />
          </Render>
        </StyledFrameBody>
    } else if (requestStatus === 'pending') {
      frameContents = (
        <Centered>
          <SpinnerContainer>
            <Spinner />
          </SpinnerContainer>
        </Centered>
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
        visElement={this.visElement}
      />
    )
  }
}

export default CypherFrame
