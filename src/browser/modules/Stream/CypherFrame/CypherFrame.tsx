/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
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

import { Record as Neo4jRecord } from 'neo4j-driver'
import { connect } from 'react-redux'
import React, { Component, Dispatch } from 'react'
import FrameTemplate from '../../Frame/FrameTemplate'
import { CypherFrameButton } from 'browser-components/buttons'
import Centered from 'browser-components/Centered'
import {
  getRequest,
  REQUEST_STATUS_PENDING,
  REQUEST_STATUS_SUCCESS,
  isCancelStatus,
  BrowserRequest,
  BrowserRequestResult
} from 'shared/modules/requests/requestsDuck'
import FrameSidebar from '../../Frame/FrameSidebar'
import {
  VisualizationIcon,
  TableIcon,
  AsciiIcon,
  CodeIcon,
  PlanIcon,
  AlertIcon,
  ErrorIcon,
  SpinnerIcon
} from 'browser-components/icons/Icons'
import { AsciiView, AsciiStatusbar } from './AsciiView'
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
  initialView
} from './helpers'
import { SpinnerContainer, StyledStatsBarContainer } from '../styled'
import { StyledFrameBody } from 'browser/modules/Frame/styled'
import {
  getMaxRows,
  getInitialNodeDisplay,
  getMaxNeighbours,
  shouldAutoComplete
} from 'shared/modules/settings/settingsDuck'
import {
  setRecentView,
  getRecentView,
  Frame,
  SetRecentViewAction
} from 'shared/modules/stream/streamDuck'
import { CancelView } from './CancelView'
import RelatableView, {
  RelatableStatusbar
} from 'browser/modules/Stream/CypherFrame/relatable-view'
import { requestExceedsVisLimits } from 'browser/modules/Stream/CypherFrame/helpers'
import { GlobalState } from 'shared/globalState'

type CypherFrameBaseProps = {
  frame: Frame
}

type CypherFrameProps = CypherFrameBaseProps & {
  autoComplete: boolean
  initialNodeDisplay: number
  maxNeighbours: number
  maxRows: number
  request: BrowserRequest
  onRecentViewChanged: (view: viewTypes.FrameView) => void
}

type CypherFrameState = {
  openView?: viewTypes.FrameView
  fullscreen: boolean
  collapse: boolean
  frameHeight: number
  hasVis: boolean
  errors?: unknown
  asciiMaxColWidth?: number
  asciiSetColWidth?: string
  planExpand: PlanExpand
}
export type PlanExpand = 'EXPAND' | 'COLLAPSE'

export class CypherFrame extends Component<CypherFrameProps, CypherFrameState> {
  visElement: null | {
    svgElement: unknown
    graphElement: unknown
    type: 'plan' | 'graph'
  } = null
  state: CypherFrameState = {
    openView: undefined,
    fullscreen: false,
    collapse: false,
    frameHeight: 472,
    hasVis: false,
    asciiMaxColWidth: undefined,
    asciiSetColWidth: undefined,
    planExpand: 'EXPAND'
  }

  changeView(view: viewTypes.FrameView): void {
    this.setState({ openView: view })
    if (this.props.onRecentViewChanged) {
      this.props.onRecentViewChanged(view)
    }
  }

  onResize = (
    fullscreen: boolean,
    collapse: boolean,
    frameHeight: number
  ): void => {
    if (frameHeight) {
      this.setState({ fullscreen, collapse, frameHeight })
    } else {
      this.setState({ fullscreen, collapse })
    }
  }

  shouldComponentUpdate(
    props: CypherFrameProps,
    state: CypherFrameState
  ): boolean {
    return (
      this.props.request.updated !== props.request.updated ||
      this.state.openView !== state.openView ||
      this.state.fullscreen !== state.fullscreen ||
      this.state.frameHeight !== state.frameHeight ||
      this.state.collapse !== state.collapse ||
      this.state.asciiMaxColWidth !== state.asciiMaxColWidth ||
      this.state.asciiSetColWidth !== state.asciiSetColWidth ||
      this.state.planExpand !== state.planExpand ||
      this.state.hasVis !== state.hasVis
    )
  }

  componentDidUpdate(): void {
    // When going from REQUEST_STATUS_PENDING to some other status
    // we want to show an initial view.
    // This happens on first render of a response and on re-runs
    if (this.props.request.status !== REQUEST_STATUS_PENDING) {
      const openView = initialView(this.props, this.state)
      if (openView !== this.state.openView) {
        const hasVis = openView === viewTypes.ERRORS ? false : this.state.hasVis
        this.setState({ openView, hasVis })
      }
    } else {
      this.visElement = null
      this.setState({ hasVis: false })
    }

    // When frame re-use leads to result without visualization
    const doneLoading = this.props.request.status === REQUEST_STATUS_SUCCESS
    const currentlyShowingViz = this.state.openView === viewTypes.VISUALIZATION
    if (doneLoading && currentlyShowingViz && !this.canShowViz()) {
      const view = initialView(this.props, {
        ...this.state,
        openView: undefined // initial view was not meant to override another view
      })
      if (view) this.setState({ openView: view })
    }
  }

  componentDidMount(): void {
    const view = initialView(this.props, this.state)
    if (view) this.setState({ openView: view })
  }

  getRecords = (): Neo4jRecord[] => {
    if (this.props.request.result && 'records' in this.props.request.result) {
      return this.props.request.result.records
    }
    return []
  }

  canShowViz = (): boolean =>
    !requestExceedsVisLimits(this.props.request) &&
    resultHasNodes(this.props.request) &&
    !this.state.errors

  sidebar = (): JSX.Element => (
    <FrameSidebar>
      <Render if={this.canShowViz()}>
        <CypherFrameButton
          data-testid="cypherFrameSidebarVisualization"
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
          data-testid="cypherFrameSidebarTable"
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
          data-testid="cypherFrameSidebarAscii"
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
          data-testid="cypherFrameSidebarPlan"
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
          data-testid="cypherFrameSidebarCode"
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

  getSpinner(): JSX.Element {
    return (
      <Centered>
        <SpinnerContainer>
          <SpinnerIcon />
        </SpinnerContainer>
      </Centered>
    )
  }

  getFrameContents(
    request: BrowserRequest,
    result: BrowserRequestResult,
    query: string
  ): JSX.Element {
    return (
      <StyledFrameBody
        data-testid="frame-loaded-contents"
        fullscreen={this.state.fullscreen}
        collapsed={this.state.collapse}
      >
        <Display if={this.state.openView === viewTypes.TEXT} lazy>
          <AsciiView
            asciiSetColWidth={this.state.asciiSetColWidth}
            maxRows={this.props.maxRows}
            result={result}
            updated={this.props.request.updated}
            setAsciiMaxColWidth={asciiMaxColWidth =>
              this.setState({ asciiMaxColWidth })
            }
          />
        </Display>
        <Display if={this.state.openView === viewTypes.TABLE} lazy>
          <RelatableView updated={this.props.request.updated} result={result} />
        </Display>
        <Display if={this.state.openView === viewTypes.CODE} lazy>
          <CodeView result={result} request={request} query={query} />
        </Display>
        <Display if={this.state.openView === viewTypes.ERRORS} lazy>
          <ErrorsView result={result} updated={this.props.request.updated} />
        </Display>
        <Display if={this.state.openView === viewTypes.WARNINGS} lazy>
          <WarningsView result={result} updated={this.props.request.updated} />
        </Display>
        <Display if={this.state.openView === viewTypes.PLAN} lazy>
          <PlanView
            planExpand={this.state.planExpand}
            result={result}
            updated={this.props.request.updated}
            fullscreen={this.state.fullscreen}
            assignVisElement={(svgElement: any, graphElement: any) => {
              this.visElement = { svgElement, graphElement, type: 'plan' }
              this.setState({ hasVis: true })
            }}
            setPlanExpand={(planExpand: PlanExpand) =>
              this.setState({ planExpand })
            }
          />
        </Display>
        <Display if={this.state.openView === viewTypes.VISUALIZATION} lazy>
          <div
            style={{
              maxHeight: '100%',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <VisualizationConnectedBus
              fullscreen={this.state.fullscreen}
              result={result}
              updated={this.props.request.updated}
              frameHeight={this.state.frameHeight}
              assignVisElement={(svgElement: any, graphElement: any) => {
                this.visElement = { svgElement, graphElement, type: 'graph' }
                this.setState({ hasVis: true })
              }}
              initialNodeDisplay={this.props.initialNodeDisplay}
              autoComplete={this.props.autoComplete}
              maxNeighbours={this.props.maxNeighbours}
            />
          </div>
        </Display>
      </StyledFrameBody>
    )
  }

  getStatusbar(result: BrowserRequestResult): JSX.Element {
    return (
      <StyledStatsBarContainer>
        <Display if={this.state.openView === viewTypes.TEXT} lazy>
          <AsciiStatusbar
            asciiMaxColWidth={this.state.asciiMaxColWidth}
            asciiSetColWidth={this.state.asciiSetColWidth}
            maxRows={this.props.maxRows}
            result={result}
            updated={this.props.request.updated}
            setAsciiSetColWidth={asciiSetColWidth =>
              this.setState({ asciiSetColWidth })
            }
          />
        </Display>
        <Display if={this.state.openView === viewTypes.TABLE} lazy>
          <RelatableStatusbar
            updated={this.props.request.updated}
            result={result}
          />
        </Display>
        <Display if={this.state.openView === viewTypes.CODE} lazy>
          <CodeStatusbar result={result} />
        </Display>
        <Display if={this.state.openView === viewTypes.ERRORS} lazy>
          <ErrorsStatusbar result={result} />
        </Display>
        <Display if={this.state.openView === viewTypes.WARNINGS} lazy>
          <WarningsStatusbar
            result={result}
            updated={this.props.request.updated}
          />
        </Display>
        <Display if={this.state.openView === viewTypes.PLAN} lazy>
          <PlanStatusbar
            result={result}
            setPlanExpand={(planExpand: PlanExpand) =>
              this.setState({ planExpand })
            }
          />
        </Display>
      </StyledStatsBarContainer>
    )
  }

  render(): JSX.Element {
    const { frame = {} as Frame, request = {} as BrowserRequest } = this.props
    const { cmd: query = '' } = frame
    const {
      result = {} as BrowserRequestResult,
      status: requestStatus
    } = request

    const frameContents =
      requestStatus === REQUEST_STATUS_PENDING ? (
        this.getSpinner()
      ) : isCancelStatus(requestStatus) ? (
        <CancelView requestStatus={requestStatus} />
      ) : (
        this.getFrameContents(request, result, query)
      )
    const statusBar =
      this.state.openView !== viewTypes.VISUALIZATION &&
      requestStatus !== 'error'
        ? this.getStatusbar(result)
        : null

    return (
      <FrameTemplate
        sidebar={requestStatus !== 'error' ? this.sidebar : undefined}
        className="no-padding"
        header={frame}
        contents={frameContents}
        statusbar={statusBar}
        numRecords={result && 'records' in result ? result.records.length : 0}
        getRecords={this.getRecords}
        onResize={this.onResize}
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

const mapStateToProps = (
  state: GlobalState,
  ownProps: CypherFrameBaseProps
) => ({
  maxRows: getMaxRows(state),
  initialNodeDisplay: getInitialNodeDisplay(state),
  maxNeighbours: getMaxNeighbours(state),
  autoComplete: shouldAutoComplete(state),
  recentView: getRecentView(state),
  request: getRequest(state, ownProps.frame.requestId)
})

const mapDispatchToProps = (dispatch: Dispatch<SetRecentViewAction>) => ({
  onRecentViewChanged: (view: viewTypes.FrameView) => {
    dispatch(setRecentView(view))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(CypherFrame)
