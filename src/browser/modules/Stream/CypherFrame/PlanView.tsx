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

import React, { Component } from 'react'
import { PlanSVG } from './PlanView.styled'
import { deepEquals, shallowEquals } from 'services/utils'
import bolt from 'services/bolt/bolt'
import { FrameButton } from 'browser-components/buttons'
import { DoubleUpIcon, DoubleDownIcon } from 'browser-components/icons/Icons'
import {
  StyledOneRowStatsBar,
  StyledRightPartial,
  StyledLeftPartial
} from '../styled'
import { StyledFrameTitlebarButtonSection } from 'browser/modules/Frame/styled'
import Ellipsis from 'browser-components/Ellipsis'
import queryPlan from '../../D3Visualization/lib/visualization/components/queryPlan'
import { PlanExpand } from './CypherFrame'

type PlanViewState = { extractedPlan: any }
type PlanViewProps = {
  _planExpand: PlanExpand
  setPlanExpand: (p: PlanExpand) => void
  result: any
  updated: any
  assignVisElement: (a: any, b: any) => void
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
      .then(() => this.props.setPlanExpand('EXPAND'))
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

  shouldComponentUpdate(props: any, state: PlanViewState) {
    if (this.props.result === undefined) return true
    return (
      !deepEquals(props.result.summary, this.props.result.summary) ||
      !shallowEquals(state, this.state) ||
      props._planExpand !== this.props._planExpand
    )
  }

  extractPlan(result: any) {
    if (result === undefined) return Promise.reject(new Error('No result'))
    return new Promise<void>(resolve => {
      const extractedPlan = bolt.extractPlan(result)
      if (extractedPlan) return this.setState({ extractedPlan }, resolve)
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
      this.props._planExpand &&
      this.props._planExpand !== prevProps._planExpand
    ) {
      switch (this.props._planExpand) {
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
    return <PlanSVG data-testid="planSvg" ref={this.planInit.bind(this)} />
  }
}

type PlanStatusbarState = { extractedPlan: any }
type PlanStatusbarProps = {
  result: any

  setPlanExpand: (p: PlanExpand) => void
}

export class PlanStatusbar extends Component<
  PlanStatusbarProps,
  PlanStatusbarState
> {
  state: PlanStatusbarState = {
    extractedPlan: null
  }

  componentDidMount() {
    if (this.props === undefined || this.props.result === undefined) return
    const extractedPlan = bolt.extractPlan(this.props.result, true)
    if (extractedPlan) this.setState({ extractedPlan })
  }

  componentDidUpdate(prevProps: any) {
    if (this.props.result === undefined) return
    if (
      prevProps.result === undefined ||
      !deepEquals(this.props.result.summary, prevProps.result.summary)
    ) {
      const extractedPlan = bolt.extractPlan(this.props.result, true)
      this.setState({ extractedPlan })
    }
  }

  shouldComponentUpdate(_props: {}, state: PlanStatusbarState) {
    if (this.props.result === undefined) return true
    return !deepEquals(state, this.state)
  }

  render() {
    const plan = this.state.extractedPlan
    if (!plan) return null
    const { result = {} } = this.props
    return (
      <StyledOneRowStatsBar>
        <StyledLeftPartial>
          <Ellipsis>
            Cypher version: {plan.root.version}, planner: {plan.root.planner},
            runtime: {plan.root.runtime}.
            {plan.root.totalDbHits
              ? ` ${
                  plan.root.totalDbHits
                } total db hits in ${result.summary.resultAvailableAfter
                  .add(result.summary.resultConsumedAfter)
                  .toNumber() || 0} ms.`
              : ''}
          </Ellipsis>
        </StyledLeftPartial>
        <StyledRightPartial>
          <StyledFrameTitlebarButtonSection>
            <FrameButton
              data-testid="planCollapseButton"
              onClick={() => this.props.setPlanExpand('COLLAPSE')}
            >
              <DoubleUpIcon />
            </FrameButton>
            <FrameButton
              data-testid="planExpandButton"
              onClick={() => this.props.setPlanExpand('EXPAND')}
            >
              <DoubleDownIcon />
            </FrameButton>
          </StyledFrameTitlebarButtonSection>
        </StyledRightPartial>
      </StyledOneRowStatsBar>
    )
  }
}
