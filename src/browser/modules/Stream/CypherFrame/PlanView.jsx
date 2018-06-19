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

import React, { Component } from 'react'
import { PlanSVG } from './PlanView.styled'
import { dim } from 'browser-styles/constants'
import { deepEquals, shallowEquals } from 'services/utils'
import bolt from 'services/bolt/bolt'
import { FrameButton } from 'browser-components/buttons'
import { DoubleUpIcon, DoubleDownIcon } from 'browser-components/icons/Icons'
import {
  StyledOneRowStatsBar,
  StyledRightPartial,
  StyledLeftPartial,
  FrameTitlebarButtonSection
} from '../styled'
import Ellipsis from 'browser-components/Ellipsis'

export class PlanView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      extractedPlan: null
    }
  }
  componentDidMount () {
    this.extractPlan(this.props.result).catch(e => {})
  }
  componentWillReceiveProps (props) {
    if (
      !deepEquals(
        (props.result || {}).summary,
        (this.props.result || {}).summary
      )
    ) {
      return this.extractPlan(props.result || {})
        .then(() => {
          this.ensureToggleExpand(props)
        })
        .catch(e => {
          console.log(e)
        })
    }
    this.ensureToggleExpand(props)
    props.assignVisElement && props.assignVisElement(this.el, this.plan)
  }
  shouldComponentUpdate (props, state) {
    if (this.props.result === undefined) return true
    return (
      !deepEquals(props.result.summary, this.props.result.summary) ||
      !shallowEquals(state, this.state) ||
      props._planExpand !== this.props._planExpand
    )
  }
  extractPlan (result) {
    if (result === undefined) return Promise.reject(new Error('No result'))
    return new Promise((resolve, reject) => {
      const extractedPlan = bolt.extractPlan(result)
      if (extractedPlan) return this.setState({ extractedPlan }, resolve())
      resolve()
    })
  }
  planInit (el) {
    if (el != null && !this.plan) {
      const NeoConstructor = neo.queryPlan
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
  ensureToggleExpand (props) {
    if (props._planExpand && props._planExpand !== this.props._planExpand) {
      switch (props._planExpand) {
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
  toggleExpanded (expanded) {
    const visit = operator => {
      operator.expanded = expanded
      if (operator.children) {
        operator.children.forEach(child => {
          visit(child)
        })
      }
    }
    let tmpPlan = { ...this.state.extractedPlan }
    visit(tmpPlan.root)
    this.plan.display(tmpPlan)
  }
  render () {
    if (!this.state.extractedPlan) return null
    return (
      <PlanSVG
        data-test-id='planSvg'
        style={
          this.props.fullscreen
            ? { 'padding-bottom': dim.frameStatusbarHeight + 'px' }
            : {}
        }
        innerRef={this.planInit.bind(this)}
      />
    )
  }
}

export class PlanStatusbar extends Component {
  constructor (props) {
    super(props)
    this.state = {
      extractedPlan: null
    }
  }
  componentDidMount () {
    if (this.props === undefined || this.props.result === undefined) return
    const extractedPlan = bolt.extractPlan(this.props.result, true)
    if (extractedPlan) this.setState({ extractedPlan })
  }
  componentWillReceiveProps (props) {
    if (props.result === undefined) return
    if (
      this.props.result === undefined ||
      !deepEquals(props.result.summary, this.props.result.summary)
    ) {
      const extractedPlan = bolt.extractPlan(props.result, true)
      this.setState({ extractedPlan })
    }
  }
  shouldComponentUpdate (props, state) {
    if (this.props.result === undefined) return true
    return !deepEquals(state, this.state)
  }
  render () {
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
              ? ` ${plan.root
                .totalDbHits} total db hits in ${result.summary.resultAvailableAfter
                .add(result.summary.resultConsumedAfter)
                .toNumber() || 0} ms.`
              : ``}
          </Ellipsis>
        </StyledLeftPartial>
        <StyledRightPartial>
          <FrameTitlebarButtonSection>
            <FrameButton
              data-test-id='planCollapseButton'
              onClick={() =>
                this.props.setParentState({ _planExpand: 'COLLAPSE' })}
            >
              <DoubleUpIcon />
            </FrameButton>
            <FrameButton
              data-test-id='planExpandButton'
              onClick={() =>
                this.props.setParentState({ _planExpand: 'EXPAND' })}
            >
              <DoubleDownIcon />
            </FrameButton>
          </FrameTitlebarButtonSection>
        </StyledRightPartial>
      </StyledOneRowStatsBar>
    )
  }
}
