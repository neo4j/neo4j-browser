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
import memoize from 'memoize-one'
import React, { Component } from 'react'

import {
  DoubleDownIcon,
  DoubleUpIcon
} from 'browser-components/icons/LegacyIcons'

import queryPlan from '../../D3Visualization/queryPlan/queryPlan'
import {
  StyledLeftPartial,
  StyledOneRowStatsBar,
  StyledRightPartial
} from '../styled'
import { PlanExpand } from './CypherFrame'
import { PlanSVG } from './PlanView.styled'
import Ellipsis from 'browser-components/Ellipsis'
import { FrameButton } from 'browser-components/buttons'
import { dim } from 'browser-styles/constants'
import { StyledFrameTitlebarButtonSection } from 'browser/modules/Frame/styled'
import bolt from 'services/bolt/bolt'
import { deepEquals } from 'neo4j-arc/common'
import { shallowEquals } from 'services/utils'

type PlanViewState = { extractedPlan: any }
export type PlanViewProps = {
  planExpand: PlanExpand
  setPlanExpand: (p: PlanExpand) => void
  result: any
  updated: any
  assignVisElement: (a: any, b: any) => void
  isFullscreen: boolean
}

export class PlanView extends Component<PlanViewProps, PlanViewState> {
  el: any
  plan: any
  constructor(props: any) {
    super(props)
    this.state = {
      extractedPlan: null
    }
  }

  componentDidMount() {
    this.extractPlan(this.props.result)
      .then(() => {
        this.props.setPlanExpand('EXPAND')
        this.toggleExpanded(true)
      })
      .catch(() => {})
  }

  componentDidUpdate(prevProps: any): any {
    if (prevProps.updated !== this.props.updated) {
      return this.extractPlan(this.props.result || {})
        .then(() => {
          this.ensureToggleExpand(prevProps)
        })
        .catch(e => {
          console.log(e)
        })
    }
    this.ensureToggleExpand(prevProps)
    this.props.assignVisElement &&
      this.props.assignVisElement(this.el, this.plan)
  }

  shouldComponentUpdate(props: PlanViewProps, state: PlanViewState) {
    if (this.props.result === undefined) return true
    return (
      props.isFullscreen !== this.props.isFullscreen ||
      !deepEquals(props.result.summary, this.props.result.summary) ||
      !shallowEquals(state, this.state) ||
      props.planExpand !== this.props.planExpand
    )
  }

  extractPlan(result: any) {
    if (result === undefined) return Promise.reject(new Error('No result'))
    return new Promise<void>(resolve => {
      const extractedPlan = bolt.extractPlan(result)
      if (extractedPlan)
        return this.setState({ extractedPlan }, resolve() as any)
      resolve()
    })
  }

  planInit(el: any) {
    if (el != null && !this.plan) {
      const NeoConstructor: any = queryPlan
      this.el = el
      this.plan = new NeoConstructor(this.el)
      this.plan.display(this.state.extractedPlan)
      this.plan.boundingBox = () => {
        return this.el.getBBox()
      }

      this.props.assignVisElement &&
        this.props.assignVisElement(this.el, this.plan)
    }
  }

  ensureToggleExpand(prevProps: any) {
    if (
      this.props.planExpand &&
      this.props.planExpand !== prevProps.planExpand
    ) {
      switch (this.props.planExpand) {
        case 'COLLAPSE': {
          this.toggleExpanded(false)
          break
        }
        case 'EXPAND': {
          this.toggleExpanded(true)
          break
        }
      }
    }
  }

  toggleExpanded(expanded: any) {
    const visit = (operator: any) => {
      operator.expanded = expanded
      if (operator.children) {
        operator.children.forEach((child: any) => {
          visit(child)
        })
      }
    }
    const tmpPlan = { ...this.state.extractedPlan }
    visit(tmpPlan.root)
    this.plan.display(tmpPlan)
  }

  render() {
    if (!this.state.extractedPlan) return null
    return (
      <PlanSVG
        data-testid="planSvg"
        style={
          this.props.isFullscreen
            ? // @ts-expect-error ts-migrate(2769) FIXME: Object literal may only specify known properties, ... Remove this comment to see the full error message
              { 'padding-bottom': dim.frameStatusbarHeight + 'px' }
            : {}
        }
        ref={this.planInit.bind(this)}
      />
    )
  }
}

type PlanStatusbarProps = {
  result: any
  setPlanExpand: (p: PlanExpand) => void
}

const extractMemoizedPlan = memoize(
  result => bolt.extractPlan(result, true),
  (newArgs: any[], lastArgs: any[]) =>
    deepEquals(newArgs[0]?.summary, lastArgs[0]?.summary)
)

export function PlanStatusbar(props: PlanStatusbarProps) {
  const { result } = props
  if (!result || !result.summary) return null

  const plan = extractMemoizedPlan(result)
  if (!plan) return null

  return (
    <StyledOneRowStatsBar>
      <StyledLeftPartial>
        <Ellipsis>
          Cypher version: {plan.root.version}, planner: {plan.root.planner},
          runtime: {plan.root.runtime}.
          {plan.root.totalDbHits
            ? ` ${plan.root.totalDbHits} total db hits in ${
                result.summary.resultAvailableAfter
                  .add(result.summary.resultConsumedAfter)
                  .toNumber() || 0
              } ms.`
            : ''}
        </Ellipsis>
      </StyledLeftPartial>
      <StyledRightPartial>
        <StyledFrameTitlebarButtonSection>
          <FrameButton
            title="Collapse Plan"
            dataTestId="planCollapseButton"
            onClick={() => props.setPlanExpand('COLLAPSE')}
          >
            <DoubleUpIcon />
          </FrameButton>
          <FrameButton
            dataTestId="planExpandButton"
            title="Expand Plan"
            onClick={() => props.setPlanExpand('EXPAND')}
          >
            <DoubleDownIcon />
          </FrameButton>
        </StyledFrameTitlebarButtonSection>
      </StyledRightPartial>
    </StyledOneRowStatsBar>
  )
}
