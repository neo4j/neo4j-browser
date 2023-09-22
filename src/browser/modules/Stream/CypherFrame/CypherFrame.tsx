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
import { saveAs } from 'file-saver'
import { map } from 'lodash'
import { Record as Neo4jRecord } from 'neo4j-driver'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

import {
  AlertIcon,
  AsciiIcon,
  CodeIcon,
  ErrorIcon,
  PlanIcon,
  SpinnerIcon,
  TableIcon,
  VisualizationIcon
} from 'browser-components/icons/LegacyIcons'

import FrameBodyTemplate from '../../Frame/FrameBodyTemplate'
import FrameSidebar from '../../Frame/FrameSidebar'
import { BaseFrameProps } from '../Stream'
import { SpinnerContainer, StyledStatsBarContainer } from '../styled'
import { AsciiStatusbar, AsciiView } from './AsciiView'
import { CancelView } from './CancelView'
import { CodeStatusbar, CodeView } from './CodeView'
import { ErrorsStatusbar } from './ErrorsView/ErrorsStatusbar'
import { ErrorsView } from './ErrorsView/ErrorsView'
import { PlanStatusbar, PlanView } from './PlanView'
import RelatableView, {
  RelatableStatusbar
} from './RelatableView/relatable-view'
import { VisualizationConnectedBus } from './VisualizationView/VisualizationView'
import { WarningsStatusbar, WarningsView } from './WarningsView'
import {
  recordToStringArray,
  initialView,
  recordToJSONMapper,
  resultHasNodes,
  resultHasPlan,
  resultHasRows,
  resultHasWarnings,
  resultIsError,
  stringifyResultArray
} from './helpers'
import Centered from 'browser-components/Centered'
import Display from 'browser-components/Display'
import { CypherFrameButton } from 'browser-components/buttons'
import { StyledFrameBody } from 'browser/modules/Frame/styled'
import { csvFormat, stringModifier } from 'services/bolt/cypherTypesFormatting'
import { downloadPNGFromSVG, downloadSVG } from 'services/exporting/imageUtils'
import { CSVSerializer } from 'services/serializer'
import { stringifyMod } from 'services/utils'
import { GlobalState } from 'shared/globalState'
import * as ViewTypes from 'shared/modules/frames/frameViewTypes'
import {
  Frame,
  SetRecentViewAction,
  getRecentView,
  setRecentView
} from 'shared/modules/frames/framesDuck'
import {
  BrowserRequest,
  BrowserRequestResult,
  REQUEST_STATUS_PENDING,
  REQUEST_STATUS_SUCCESS,
  getRequest,
  isCancelStatus
} from 'shared/modules/requests/requestsDuck'
import {
  getInitialNodeDisplay,
  getMaxNeighbours,
  getMaxRows,
  shouldAutoComplete
} from 'shared/modules/settings/settingsDuck'

export type CypherFrameProps = BaseFrameProps & {
  autoComplete: boolean
  initialNodeDisplay: number
  maxNeighbours: number
  maxRows: number
  request: BrowserRequest
  onRecentViewChanged: (view: ViewTypes.FrameView) => void
}

type CypherFrameState = {
  openView?: ViewTypes.FrameView
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
    hasVis: false,
    asciiMaxColWidth: undefined,
    asciiSetColWidth: undefined,
    planExpand: 'EXPAND'
  }

  changeView(view: ViewTypes.FrameView): void {
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
      this.state.openView !== state.openView ||
      this.props.isCollapsed !== props.isCollapsed ||
      this.props.isFullscreen !== props.isFullscreen ||
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
        const hasVis = openView === ViewTypes.ERRORS ? false : this.state.hasVis
        this.setState({ openView, hasVis })
      }
    } else {
      this.visElement = null
      this.setState({ hasVis: false })
    }

    // When frame re-use leads to result without visualization
    const doneLoading = this.props.request.status === REQUEST_STATUS_SUCCESS
    const currentlyShowingViz = this.state.openView === ViewTypes.VISUALIZATION
    if (doneLoading && currentlyShowingViz && !this.canShowViz()) {
      const view = initialView(this.props, {
        ...this.state,
        openView: undefined // initial view was not meant to override another view
      })
      if (view) this.setState({ openView: view })
    }

    const textDownloadEnabled = () =>
      this.getRecords().length > 0 &&
      this.state.openView &&
      [
        ViewTypes.TEXT,
        ViewTypes.TABLE,
        ViewTypes.CODE,
        ViewTypes.VISUALIZATION
      ].includes(this.state.openView)
    const graphicsDownloadEnabled = () =>
      this.visElement &&
      this.state.openView &&
      [ViewTypes.PLAN, ViewTypes.VISUALIZATION].includes(this.state.openView)

    const downloadText = [
      { name: 'CSV', download: this.exportCSV },
      { name: 'JSON', download: this.exportJSON }
    ]
    const downloadGraphics = [
      { name: 'PNG', download: this.exportPNG },
      { name: 'SVG', download: this.exportSVG }
    ]

    this.props.setExportItems([
      ...(textDownloadEnabled() ? downloadText : []),
      ...(this.hasStringPlan() && this.state.openView === ViewTypes.PLAN
        ? [{ name: 'TXT', download: this.exportStringPlan }]
        : []),
      ...(graphicsDownloadEnabled() ? downloadGraphics : [])
    ])
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
    resultHasNodes(this.props.request) && !this.state.errors

  sidebar = (): JSX.Element => (
    <FrameSidebar>
      {this.canShowViz() && (
        <CypherFrameButton
          data-testid="cypherFrameSidebarVisualization"
          selected={this.state.openView === ViewTypes.VISUALIZATION}
          onClick={() => {
            this.changeView(ViewTypes.VISUALIZATION)
          }}
        >
          <VisualizationIcon />
        </CypherFrameButton>
      )}
      {!resultIsError(this.props.request) && (
        <CypherFrameButton
          data-testid="cypherFrameSidebarTable"
          selected={this.state.openView === ViewTypes.TABLE}
          onClick={() => {
            this.changeView(ViewTypes.TABLE)
          }}
        >
          <TableIcon />
        </CypherFrameButton>
      )}
      {resultHasRows(this.props.request) && !resultIsError(this.props.request) && (
        <CypherFrameButton
          data-testid="cypherFrameSidebarAscii"
          selected={this.state.openView === ViewTypes.TEXT}
          onClick={() => {
            this.changeView(ViewTypes.TEXT)
          }}
        >
          <AsciiIcon />
        </CypherFrameButton>
      )}
      {resultHasPlan(this.props.request) && (
        <CypherFrameButton
          data-testid="cypherFrameSidebarPlan"
          selected={this.state.openView === ViewTypes.PLAN}
          onClick={() => this.changeView(ViewTypes.PLAN)}
        >
          <PlanIcon />
        </CypherFrameButton>
      )}
      {resultHasWarnings(this.props.request) && (
        <CypherFrameButton
          selected={this.state.openView === ViewTypes.WARNINGS}
          onClick={() => {
            this.changeView(ViewTypes.WARNINGS)
          }}
        >
          <AlertIcon />
        </CypherFrameButton>
      )}
      {resultIsError(this.props.request) ? (
        <CypherFrameButton
          selected={this.state.openView === ViewTypes.ERRORS}
          onClick={() => {
            this.changeView(ViewTypes.ERRORS)
          }}
        >
          <ErrorIcon />
        </CypherFrameButton>
      ) : (
        <CypherFrameButton
          data-testid="cypherFrameSidebarCode"
          selected={this.state.openView === ViewTypes.CODE}
          onClick={() => {
            this.changeView(ViewTypes.CODE)
          }}
        >
          <CodeIcon />
        </CypherFrameButton>
      )}
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
        isFullscreen={this.props.isFullscreen}
        isCollapsed={this.props.isCollapsed}
        preventOverflow={this.state.openView === ViewTypes.VISUALIZATION}
        removePadding
      >
        <Display if={this.state.openView === ViewTypes.TEXT} lazy>
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
        <Display if={this.state.openView === ViewTypes.TABLE} lazy>
          <RelatableView updated={this.props.request.updated} result={result} />
        </Display>
        <Display if={this.state.openView === ViewTypes.CODE} lazy>
          <CodeView result={result} request={request} query={query} />
        </Display>
        <Display if={this.state.openView === ViewTypes.ERRORS} lazy>
          <ErrorsView result={result} updated={this.props.request.updated} />
        </Display>
        <Display if={this.state.openView === ViewTypes.WARNINGS} lazy>
          <WarningsView result={result} updated={this.props.request.updated} />
        </Display>
        <Display if={this.state.openView === ViewTypes.PLAN} lazy>
          <PlanView
            planExpand={this.state.planExpand}
            result={result}
            updated={this.props.request.updated}
            isFullscreen={this.props.isFullscreen}
            assignVisElement={(svgElement: any, graphElement: any) => {
              this.visElement = { svgElement, graphElement, type: 'plan' }
              this.setState({ hasVis: true })
            }}
            setPlanExpand={(planExpand: PlanExpand) =>
              this.setState({ planExpand })
            }
          />
        </Display>
        <Display if={this.state.openView === ViewTypes.VISUALIZATION} lazy>
          <VisualizationConnectedBus
            isFullscreen={this.props.isFullscreen}
            result={result}
            updated={this.props.request.updated}
            assignVisElement={(svgElement: any, graphElement: any) => {
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

  getStatusbar(result: BrowserRequestResult): JSX.Element {
    return (
      <StyledStatsBarContainer>
        <Display if={this.state.openView === ViewTypes.TEXT} lazy>
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
        <Display if={this.state.openView === ViewTypes.TABLE} lazy>
          <RelatableStatusbar
            updated={this.props.request.updated}
            result={result}
          />
        </Display>
        <Display if={this.state.openView === ViewTypes.CODE} lazy>
          <CodeStatusbar result={result} />
        </Display>
        <Display if={this.state.openView === ViewTypes.ERRORS} lazy>
          <ErrorsStatusbar result={result} />
        </Display>
        <Display if={this.state.openView === ViewTypes.WARNINGS} lazy>
          <WarningsStatusbar
            result={result}
            updated={this.props.request.updated}
          />
        </Display>
        <Display if={this.state.openView === ViewTypes.PLAN} lazy>
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

  exportCSV = (): void => {
    const records = this.getRecords()
    const firstRecord = records[0]
    const keys = firstRecord?.length > 0 ? firstRecord.keys : []

    const exportdataRaw = [keys]
    exportdataRaw.push(
      ...(records.map(record => recordToStringArray(record)) as any)
    )
    const exportData = stringifyResultArray(csvFormat, exportdataRaw)
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

  hasStringPlan = (): boolean =>
    // @ts-ignore driver types don't have string-representation yet
    !!this.props.request?.result?.summary?.plan?.arguments?.[
      'string-representation'
    ]

  exportStringPlan = (): void => {
    const data =
      // @ts-ignore driver types don't have string-representation yet
      this.props.request?.result?.summary?.plan?.arguments?.[
        'string-representation'
      ]
    if (data) {
      const blob = new Blob([data], {
        type: 'text/plain;charset=utf-8'
      })
      saveAs(blob, 'plan.txt')
    }
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

  render(): JSX.Element {
    const { frame = {} as Frame, request = {} as BrowserRequest } = this.props
    const { cmd: query = '' } = frame
    const { result = {} as BrowserRequestResult, status: requestStatus } =
      request

    const frameContents =
      requestStatus === REQUEST_STATUS_PENDING ? (
        this.getSpinner()
      ) : isCancelStatus(requestStatus) ? (
        <CancelView requestStatus={requestStatus} />
      ) : (
        this.getFrameContents(request, result, query)
      )
    const statusBar =
      this.state.openView !== ViewTypes.VISUALIZATION &&
      requestStatus !== 'error'
        ? this.getStatusbar(result)
        : null

    return (
      <FrameBodyTemplate
        isCollapsed={this.props.isCollapsed}
        isFullscreen={this.props.isFullscreen}
        sidebar={requestStatus !== 'error' ? this.sidebar : undefined}
        contents={frameContents}
        statusBar={statusBar}
        removePadding
      />
    )
  }
  componentWillUnmount(): void {
    this.props.setExportItems([])
  }
}

const mapStateToProps = (state: GlobalState, ownProps: BaseFrameProps) => ({
  maxRows: getMaxRows(state),
  initialNodeDisplay: getInitialNodeDisplay(state),
  maxNeighbours: getMaxNeighbours(state),
  autoComplete: shouldAutoComplete(state),
  recentView: getRecentView(state),
  request: getRequest(state, ownProps.frame.requestId)
})

const mapDispatchToProps = (dispatch: Dispatch<SetRecentViewAction>) => ({
  onRecentViewChanged: (view: ViewTypes.FrameView) => {
    dispatch(setRecentView(view))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(CypherFrame)
