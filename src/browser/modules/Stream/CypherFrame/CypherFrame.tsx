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
import { WarningsView } from './WarningsView'
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
  stringifyResultArray,
  transformResultRecordsToResultArray,
  recordToJSONMapper
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
import { csvFormat, stringModifier } from 'services/bolt/cypherTypesFormatting'
import { CSVSerializer } from 'services/serializer'
import { map } from 'lodash'
import { stringifyMod } from 'services/utils'
import { downloadPNGFromSVG, downloadSVG } from 'services/exporting/imageUtils'
import { saveAs } from 'file-saver'
import { ExportItem } from '../ExportButtons'

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
  setExportItems: (exportItems: ExportItem[]) => void
  frameHeight: string
}

export type CypherFrameState = {
  openView?: viewTypes.FrameView
  hasVis: boolean
  errors?: unknown
  _asciiMaxColWidth?: number
  _asciiSetColWidth?: string
  _planExpand: PlanExpand
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
    hasVis: false,
    _planExpand: 'EXPAND'
  }

  changeView(view: viewTypes.FrameView): void {
    this.setState({ openView: view })
    if (this.props.onRecentViewChanged) {
      this.props.onRecentViewChanged(view)
    }
  }

  shouldComponentUpdate(
    props: CypherFrameProps,
    state: CypherFrameState
  ): boolean {
    return (
      this.props.request.updated !== props.request.updated ||
      this.props.frameHeight !== props.frameHeight ||
      this.state.openView !== state.openView ||
      this.state._asciiMaxColWidth !== state._asciiMaxColWidth ||
      this.state._asciiSetColWidth !== state._asciiSetColWidth ||
      this.state._planExpand !== state._planExpand ||
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

    const downloadGraphics = [
      { name: 'PNG', download: this.exportPNG },
      { name: 'SVG', download: this.exportSVG }
    ]
    this.props.setExportItems([
      { name: 'CSV', download: this.exportCSV },
      { name: 'JSON', download: this.exportJSON },
      ...(this.visElement ? downloadGraphics : [])
    ])
  }

  componentDidMount(): void {
    const view = initialView(this.props, this.state)
    this.props.setExportItems([
      { name: 'CSV', download: this.exportCSV },
      { name: 'JSON', download: this.exportJSON }
    ])
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

  exportCSV = (): void => {
    const records = this.getRecords()
    const exportData = stringifyResultArray(
      csvFormat,
      transformResultRecordsToResultArray(records)
    )
    const data = exportData.slice()
    const csv = CSVSerializer(data.shift())
    csv.appendRows(data)
    const blob = new Blob([csv.output()], {
      type: 'text/plain;charset=utf-8'
    })
    saveAs(blob, 'export.csv')
  }

  exportJSON = (): void => {
    const records = this.getRecords()
    const exportData = map(records, recordToJSONMapper)
    const data = stringifyMod(exportData, stringModifier, true)
    const blob = new Blob([data], {
      type: 'text/plain;charset=utf-8'
    })
    saveAs(blob, 'records.json')
  }

  exportPNG = (): void => {
    if (this.visElement) {
      const { svgElement, graphElement, type } = this.visElement
      downloadPNGFromSVG(svgElement, graphElement, type)
    }
  }

  exportSVG = (): void => {
    if (this.visElement) {
      const { svgElement, graphElement, type } = this.visElement
      downloadSVG(svgElement, graphElement, type)
    }
  }

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
      <StyledFrameBody removePadding data-testid="frame-loaded-contents">
        <Display if={this.state.openView === viewTypes.TEXT} lazy>
          <AsciiView
            _asciiSetColWidth={this.state._asciiSetColWidth}
            maxRows={this.props.maxRows}
            result={result}
            updated={this.props.request.updated}
            setAsciiMaxColWidth={_asciiMaxColWidth =>
              this.setState({ _asciiMaxColWidth })
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
            _planExpand={this.state._planExpand}
            result={result}
            updated={this.props.request.updated}
            assignVisElement={(svgElement: any, graphElement: any) => {
              this.visElement = { svgElement, graphElement, type: 'plan' }
              this.setState({ hasVis: true })
            }}
            setPlanExpand={(_planExpand: PlanExpand) =>
              this.setState({ _planExpand })
            }
          />
        </Display>
        <Display if={this.state.openView === viewTypes.VISUALIZATION} lazy>
          <VisualizationConnectedBus
            frameHeight={this.props.frameHeight}
            assignVisElement={(svgElement: any, graphElement: any) => {
              this.visElement = { svgElement, graphElement, type: 'graph' }
              this.setState({ hasVis: true })
            }}
            autoComplete={this.props.autoComplete}
            initialNodeDisplay={this.props.initialNodeDisplay}
            maxNeighbours={this.props.maxNeighbours}
            result={result}
            updated={this.props.request.updated}
          />
        </Display>
      </StyledFrameBody>
    )
  }

  getStatusbar(result: BrowserRequestResult): JSX.Element {
    return (
      <StyledStatsBarContainer>
        <Display if={this.state.openView === viewTypes.TEXT} lazy>
          <AsciiStatusbar
            _asciiMaxColWidth={this.state._asciiMaxColWidth}
            _asciiSetColWidth={this.state._asciiSetColWidth}
            maxRows={this.props.maxRows}
            result={result}
            updated={this.props.request.updated}
            setAsciiSetColWidth={_asciiSetColWidth =>
              this.setState({ _asciiSetColWidth })
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
        <Display if={this.state.openView === viewTypes.PLAN} lazy>
          <PlanStatusbar
            result={result}
            setPlanExpand={(_planExpand: PlanExpand) =>
              this.setState({ _planExpand })
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
        contents={frameContents}
        statusbar={statusBar}
        removePadding
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
