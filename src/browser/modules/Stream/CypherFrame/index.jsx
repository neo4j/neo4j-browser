/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
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

import { connect } from 'preact-redux'
import { Component } from 'preact'
import FrameTemplate from '../FrameTemplate'
import { CypherFrameButton } from 'browser-components/buttons'
import Centered from 'browser-components/Centered'
import { v1 as neo4j } from 'neo4j-driver-alias'
import { deepEquals } from 'services/utils'
import { getRequest } from 'shared/modules/requests/requestsDuck'
import FrameSidebar from '../FrameSidebar'
import {
  VisualizationIcon,
  TableIcon,
  AsciiIcon,
  CodeIcon,
  PlanIcon,
  AlertIcon,
  ErrorIcon,
  Spinner
} from 'browser-components/icons/Icons'
import { AsciiView, AsciiStatusbar } from './AsciiView'
import { TableView, TableStatusbar } from './TableView'
import { CodeView, CodeStatusbar } from './CodeView'
import { ErrorsViewBus as ErrorsView, ErrorsStatusbar } from './ErrorsView'
import { WarningsView, WarningsStatusbar } from './WarningsView'
import { PlanView, PlanStatusbar } from './PlanView'
import { VisualizationConnectedBus } from './VisualizationView'
import Render from 'browser-components/Render'
import Display from 'browser-components/Display'
import * as viewTypes from 'shared/modules/stream/frameViewTypes'
import {
  resultHasRows,
  resultHasWarnings,
  resultHasPlan,
  resultIsError,
  resultHasNodes,
  initialView,
  transformResultRecordsToResultArray,
  stringifyResultArray
} from './helpers'
import {
  StyledFrameBody,
  SpinnerContainer,
  StyledStatsBarContainer
} from '../styled'
import {
  getMaxRows,
  getInitialNodeDisplay,
  getMaxNeighbours,
  shouldAutoComplete
} from 'shared/modules/settings/settingsDuck'
import { setRecentView, getRecentView } from 'shared/modules/stream/streamDuck'

export class CypherFrame extends Component {
  constructor (props) {
    super(props)
    this.state = {
      openView: undefined,
      exportData: null,
      fullscreen: false
    }
  }
  makeExportData (records) {
    return stringifyResultArray(
      neo4j.isInt,
      transformResultRecordsToResultArray(records)
    )
  }
  changeView (view) {
    this.setState({ openView: view })
    if (this.props.onRecentViewChanged) {
      this.props.onRecentViewChanged(view)
    }
  }
  onResize (fullscreen, collapse, frameHeight) {
    if (frameHeight) {
      this.setState({ fullscreen, collapse, frameHeight })
    } else {
      this.setState({ fullscreen, collapse })
    }
  }
  shouldComponentUpdate (props, state) {
    return !(deepEquals(state, this.state) && deepEquals(props, this.props))
  }
  componentWillReceiveProps (props) {
    const newState = {}
    if (
      props.request.status !== 'pending' &&
      this.state.openView === undefined
    ) {
      const view = initialView(props, this.state)
      if (view) newState['openView'] = view
    }
    if (
      this.props.request === undefined ||
      !deepEquals(props.request.result, this.props.request.result)
    ) {
      if (
        props.request.result &&
        props.request.result.records &&
        props.request.result.records.length
      ) {
        newState['exportData'] = this.makeExportData(
          props.request.result.records
        )
      } else {
        newState['exportData'] = null
      }
    }
    if (Object.keys(newState).length) this.setState(newState)
  }
  componentDidMount () {
    const view = initialView(this.props, this.state)
    if (view) this.setState({ openView: view })
    if (
      this.props.request &&
      this.props.request.result &&
      this.props.request.result.records &&
      this.props.request.result.records.length
    ) {
      this.setState({
        exportData: this.makeExportData(this.props.request.result.records)
      })
    }
  }
  sidebar () {
    return (
      <FrameSidebar>
        <Render if={resultHasNodes(this.props.request) && !this.state.errors}>
          <CypherFrameButton
            selected={this.state.openView === viewTypes.VISUALIZATION}
            onClick={() => {
              this.changeView(viewTypes.VISUALIZATION)
            }}
          >
            <VisualizationIcon />
          </CypherFrameButton>
        </Render>
        <Render if={!resultIsError(this.props.request)}>
          <CypherFrameButton
            selected={this.state.openView === viewTypes.TABLE}
            onClick={() => {
              this.changeView(viewTypes.TABLE)
            }}
          >
            <TableIcon />
          </CypherFrameButton>
        </Render>
        <Render
          if={
            resultHasRows(this.props.request) &&
            !resultIsError(this.props.request)
          }
        >
          <CypherFrameButton
            selected={this.state.openView === viewTypes.TEXT}
            onClick={() => {
              this.changeView(viewTypes.TEXT)
            }}
          >
            <AsciiIcon />
          </CypherFrameButton>
        </Render>
        <Render if={resultHasPlan(this.props.request)}>
          <CypherFrameButton
            selected={this.state.openView === viewTypes.PLAN}
            onClick={() => this.changeView(viewTypes.PLAN)}
          >
            <PlanIcon />
          </CypherFrameButton>
        </Render>
        <Render if={resultHasWarnings(this.props.request)}>
          <CypherFrameButton
            selected={this.state.openView === viewTypes.WARNINGS}
            onClick={() => {
              this.changeView(viewTypes.WARNINGS)
            }}
          >
            <AlertIcon />
          </CypherFrameButton>
        </Render>
        <Render if={resultIsError(this.props.request)}>
          <CypherFrameButton
            selected={this.state.openView === viewTypes.ERRORS}
            onClick={() => {
              this.changeView(viewTypes.ERRORS)
            }}
          >
            <ErrorIcon />
          </CypherFrameButton>
        </Render>
        <Render if={!resultIsError(this.props.request)}>
          <CypherFrameButton
            selected={this.state.openView === viewTypes.CODE}
            onClick={() => {
              this.changeView(viewTypes.CODE)
            }}
          >
            <CodeIcon />
          </CypherFrameButton>
        </Render>
      </FrameSidebar>
    )
  }
  getSpinner () {
    return (
      <Centered>
        <SpinnerContainer>
          <Spinner />
        </SpinnerContainer>
      </Centered>
    )
  }
  getFrameContents (request, result, query) {
    return (
      <StyledFrameBody
        fullscreen={this.state.fullscreen}
        collapsed={this.state.collapse}
      >
        <Display if={this.state.openView === viewTypes.TEXT} lazy>
          <AsciiView
            {...this.state}
            maxRows={this.props.maxRows}
            result={result}
            setParentState={this.setState.bind(this)}
          />
        </Display>
        <Display if={this.state.openView === viewTypes.TABLE} lazy>
          <TableView
            {...this.state}
            maxRows={this.props.maxRows}
            result={result}
            setParentState={this.setState.bind(this)}
          />
        </Display>
        <Display if={this.state.openView === viewTypes.CODE} lazy>
          <CodeView
            {...this.state}
            result={result}
            request={request}
            query={query}
            setParentState={this.setState.bind(this)}
          />
        </Display>
        <Display if={this.state.openView === viewTypes.ERRORS} lazy>
          <ErrorsView
            {...this.state}
            result={result}
            setParentState={this.setState.bind(this)}
          />
        </Display>
        <Display if={this.state.openView === viewTypes.WARNINGS} lazy>
          <WarningsView
            {...this.state}
            result={result}
            setParentState={this.setState.bind(this)}
          />
        </Display>
        <Display if={this.state.openView === viewTypes.PLAN} lazy>
          <PlanView
            {...this.state}
            result={result}
            setParentState={this.setState.bind(this)}
            assignVisElement={(svgElement, graphElement) => {
              this.visElement = { svgElement, graphElement, type: 'plan' }
              this.setState({ hasVis: true })
            }}
          />
        </Display>
        <Display if={this.state.openView === viewTypes.VISUALIZATION} lazy>
          <VisualizationConnectedBus
            {...this.state}
            result={result}
            setParentState={this.setState.bind(this)}
            frameHeight={this.state.frameHeight}
            assignVisElement={(svgElement, graphElement) => {
              this.visElement = { svgElement, graphElement, type: 'graph' }
              this.setState({ hasVis: true })
            }}
            initialNodeDisplay={this.props.initialNodeDisplay}
            autoComplete={this.props.autoComplete}
            maxNeighbours={this.props.maxNeighbours}
          />
        </Display>
      </StyledFrameBody>
    )
  }
  getStatusbar (result) {
    return (
      <StyledStatsBarContainer>
        <Display if={this.state.openView === viewTypes.TEXT} lazy>
          <AsciiStatusbar
            {...this.state}
            maxRows={this.props.maxRows}
            result={result}
            setParentState={this.setState.bind(this)}
          />
        </Display>
        <Display if={this.state.openView === viewTypes.TABLE} lazy>
          <TableStatusbar
            {...this.state}
            maxRows={this.props.maxRows}
            result={result}
            setParentState={this.setState.bind(this)}
          />
        </Display>
        <Display if={this.state.openView === viewTypes.CODE} lazy>
          <CodeStatusbar
            {...this.state}
            result={result}
            setParentState={this.setState.bind(this)}
          />
        </Display>
        <Display if={this.state.openView === viewTypes.ERRORS} lazy>
          <ErrorsStatusbar
            {...this.state}
            result={result}
            setParentState={this.setState.bind(this)}
          />
        </Display>
        <Display if={this.state.openView === viewTypes.WARNINGS} lazy>
          <WarningsStatusbar
            {...this.state}
            result={result}
            setParentState={this.setState.bind(this)}
          />
        </Display>
        <Display if={this.state.openView === viewTypes.PLAN} lazy>
          <PlanStatusbar
            {...this.state}
            result={result}
            setParentState={this.setState.bind(this)}
          />
        </Display>
      </StyledStatsBarContainer>
    )
  }
  render () {
    const { frame = {}, request = {} } = this.props
    const { cmd: query = '' } = frame
    const { result = {}, status: requestStatus } = request

    const frameContents =
      requestStatus !== 'pending'
        ? this.getFrameContents(request, result, query)
        : this.getSpinner()
    const statusBar =
      this.state.openView !== viewTypes.VISUALIZATION
        ? this.getStatusbar(result)
        : null

    return (
      <FrameTemplate
        sidebar={this.sidebar.bind(this)}
        header={frame}
        contents={frameContents}
        statusbar={statusBar}
        exportData={
          this.state.openView !== viewTypes.VISUALIZATION &&
          this.state.openView !== viewTypes.PLAN
            ? this.state.exportData
            : null
        }
        onResize={this.onResize.bind(this)}
        visElement={
          this.state.hasVis &&
          (this.state.openView === viewTypes.VISUALIZATION ||
            this.state.openView === viewTypes.PLAN)
            ? this.visElement
            : null
        }
      />
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    maxRows: getMaxRows(state),
    initialNodeDisplay: getInitialNodeDisplay(state),
    maxNeighbours: getMaxNeighbours(state),
    autoComplete: shouldAutoComplete(state),
    recentView: getRecentView(state),
    request: getRequest(state, ownProps.frame.requestId)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onRecentViewChanged: view => {
      dispatch(setRecentView(view))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CypherFrame)
