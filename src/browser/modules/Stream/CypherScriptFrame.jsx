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
import FrameTemplate from './FrameTemplate'
import { PaddedDiv } from './styled'
import { getRequest } from 'shared/modules/requests/requestsDuck'
import { getFrame } from 'shared/modules/stream/streamDuck'
import {
  StyledFrameCommand,
  FrameTitlebarButtonSection
} from 'browser/modules/Stream/styled'
import { FrameButton, StyledStatusSection } from 'browser-components/buttons'
import { DownIcon, SmallSpinner } from 'browser-components/icons/Icons'
import { PauseIcon } from 'browser-components/icons/Icons'
import { DoneIcon } from 'browser-components/icons/Icons'
import { SimpleMinusIcon } from 'browser-components/icons/Icons'
import { ExclamationTriangleIcon } from 'browser-components/icons/Icons'
import { StyledBodyMessage } from 'browser/modules/Stream/styled'
import { getBodyAndStatusBarMessages } from 'browser/modules/Stream/CypherFrame/helpers'

class Accordion extends Component {
  state = {
    activeIndex: -1
  }
  accordionClick = index => {
    const newIndex = this.state.activeIndex === index ? -1 : index
    this.setState({ activeIndex: newIndex })
  }
  render () {
    const { activeIndex } = this.state
    const { accordionClick } = this
    return (
      <div
        style={{
          border: '1px solid rgba(34, 36, 38, .15)'
        }}
      >
        {this.props.render({ activeIndex, accordionClick })}
      </div>
    )
  }
}
const Title = ({ children, status, ...rest }) => {
  console.log('children: ', children)
  return (
    <div
      {...rest}
      style={{
        borderTop: '1px solid rgba(34, 36, 38, .15)',
        borderBottom: '1px solid rgba(34, 36, 38, .15)',
        height: '39px',
        display: 'flex',
        cursor: 'pointer'
      }}
    >
      <StyledFrameCommand style={{ cursor: 'pointer' }}>
        {children}
      </StyledFrameCommand>
      <FrameTitlebarButtonSection>
        <StyledStatusSection title={`Status: ${status}`}>
          {status === 'pending' ? (
            <SmallSpinner />
          ) : status === 'waiting' ? (
            <PauseIcon />
          ) : status === 'success' ? (
            <DoneIcon />
          ) : status === 'skipped' ? (
            <SimpleMinusIcon />
          ) : status === 'error' ? (
            <ExclamationTriangleIcon />
          ) : (
            '??'
          )}
        </StyledStatusSection>
      </FrameTitlebarButtonSection>
    </div>
  )
}
Accordion.Title = Title

const Content = ({ children, active, ...rest }) => {
  if (!active) return null
  return (
    <div {...rest} style={{ backgroundColor: 'white' }}>
      {children}
    </div>
  )
}
Accordion.Content = Content

const Summary = ({ status, request }) => {
  console.log('request: ', request)
  switch (status) {
    case 'skipped':
      return (
        <em>
          Only cypher commands will be executed in the multi statement mode.
        </em>
      )
    case 'pending':
      return <em>Currently executing this query.</em>
    case 'waiting':
      return (
        <em>
          This query is waiting for it's turn. The excution is serial and will
          break on first error.
        </em>
      )
    case 'success':
      const { bodyMessage } = getBodyAndStatusBarMessages(
        request.result,
        999999999
      )
      return <StyledBodyMessage>{bodyMessage}</StyledBodyMessage>
    case 'error':
      return <em>Error!</em>
  }
}

class CypherScriptFrame extends Component {
  render () {
    const { frame, frames, requests = {} } = this.props
    const contents = (
      <PaddedDiv style={{ paddingTop: '20px' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ flex: '0 0 25%' }}>
            <h3 style={{ fontSize: '24px', color: '#333', fontWeight: '400' }}>
              Multi statement execution
            </h3>
            <p style={{ fontWeight: '300', fontSize: '15px', color: '#333' }}>
              Statements are executed in order and breaks on first fail.<br />
              Click on any row the right to see more details.
            </p>
          </div>
          <div style={{ flex: '1' }}>
            <Accordion
              render={({ activeIndex, accordionClick }) => {
                console.log('frame.statements: ', frame.statements)
                return (
                  <div>
                    {(frame.statements || []).map((id, index) => {
                      const status = frames[id].ignore
                        ? 'skipped'
                        : requests[frames[id].requestId].status
                      return (
                        <div>
                          <Accordion.Title
                            key={id}
                            active={activeIndex === index}
                            index={index}
                            onClick={() => accordionClick(index)}
                            status={status}
                          >
                            {frames[id].cmd}
                          </Accordion.Title>
                          <Accordion.Content active={activeIndex === index}>
                            <div style={{ padding: '10px' }}>
                              <Summary
                                status={status}
                                request={requests[frames[id].requestId]}
                              />
                            </div>
                          </Accordion.Content>
                        </div>
                      )
                    })}
                  </div>
                )
              }}
            />
          </div>
        </div>
      </PaddedDiv>
    )
    return <FrameTemplate header={frame} contents={contents} />
  }
}

const mapStateToProps = (state, ownProps) => {
  if (!ownProps.frame.statements) return {}
  const frames = ownProps.frame.statements
    .map(id => getFrame(state, id))
    .reduce((all, curr) => {
      all[curr.id] = curr
      return all
    }, {})
  const requests = Object.keys(frames)
    .map(id => {
      const requestId = frames[id].requestId
      if (!requestId) return false
      const request = getRequest(state, requestId)
      if (!request) return false
      request.id = requestId
      return request
    })
    .filter(a => !!a)
    .reduce((all, curr) => {
      all[curr.id] = curr
      return all
    }, {})
  return {
    frames,
    requests
  }
}

export default connect(mapStateToProps)(CypherScriptFrame)
