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
import { getRequest } from 'shared/modules/requests/requestsDuck'
import { getFrame } from 'shared/modules/stream/streamDuck'
import { StyledStatusSection } from 'browser-components/buttons'
import {
  SmallSpinner,
  PauseIcon,
  DoneIcon,
  ExclamationTriangleIcon
} from 'browser-components/icons/Icons'
import { getBodyAndStatusBarMessages } from 'browser/modules/Stream/CypherFrame/helpers'
import { errorMessageFormater } from 'browser/modules/Stream/errorMessageFormater'
import {
  FrameTitlebarButtonSection,
  StyledCypherErrorMessage,
  StyledCypherWarningMessage,
  StyledCypherSuccessMessage,
  StyledCypherInfoMessage
} from 'browser/modules/Stream/styled'
import {
  WrapperCenter,
  MessageArea,
  ContentSizer,
  PointerFrameCommand,
  WarningSpan,
  ErrorSpan,
  SuccessSpan,
  PaddedStatsBar
} from './styled'
import Accordion from 'browser-components/Accordion/Accordion'

const getIcon = status => {
  switch (status) {
    case 'pending':
      return <SmallSpinner />
    case 'skipped':
    case 'waiting':
      return <PauseIcon />
    case 'success':
      return (
        <SuccessSpan>
          <DoneIcon />
        </SuccessSpan>
      )
    case 'ignored':
      return (
        <WarningSpan>
          <ExclamationTriangleIcon />
        </WarningSpan>
      )
    case 'error':
      return (
        <ErrorSpan>
          <ExclamationTriangleIcon />
        </ErrorSpan>
      )
    default:
      return '???'
  }
}

const Summary = ({ status, request }) => {
  switch (status) {
    case 'ignored':
      return (
        <PaddedStatsBar>
          <StyledCypherWarningMessage>WARNING</StyledCypherWarningMessage>
          <MessageArea>
            Only cypher commands will be executed in the multi statement mode.
          </MessageArea>
        </PaddedStatsBar>
      )
    case 'skipped':
      return (
        <PaddedStatsBar>
          <StyledCypherInfoMessage>INFO</StyledCypherInfoMessage>
          <MessageArea>
            This statements was not executed due to a previous error.
          </MessageArea>
        </PaddedStatsBar>
      )
    case 'pending':
      return (
        <PaddedStatsBar>
          <StyledCypherInfoMessage>INFO</StyledCypherInfoMessage>
          <MessageArea>Currently executing this query...</MessageArea>
        </PaddedStatsBar>
      )
    case 'waiting':
      return (
        <PaddedStatsBar>
          <StyledCypherInfoMessage>INFO</StyledCypherInfoMessage>
          <MessageArea>
            This query is waiting for it's turn. The excution is serial and will
            break on first error.
          </MessageArea>
        </PaddedStatsBar>
      )
    case 'success':
      const { bodyMessage } = getBodyAndStatusBarMessages(
        request.result,
        999999999
      )
      return (
        <PaddedStatsBar>
          <StyledCypherSuccessMessage>SUCCESS</StyledCypherSuccessMessage>
          <MessageArea>{ucFirst(bodyMessage)}</MessageArea>
        </PaddedStatsBar>
      )
    case 'error':
      const fullError = errorMessageFormater(
        request.result.code,
        request.result.message
      )
      return (
        <PaddedStatsBar>
          <StyledCypherErrorMessage>ERROR</StyledCypherErrorMessage>
          <MessageArea>{fullError.message}</MessageArea>
        </PaddedStatsBar>
      )
  }
}

const ucFirst = str => str[0].toUpperCase() + str.slice(1)

class CypherScriptFrame extends Component {
  render () {
    const { frame, frames, requests = {} } = this.props
    const contents = (
      <WrapperCenter>
        <ContentSizer>
          <Accordion
            render={({ getChildProps }) => {
              return (
                <div>
                  {(frame.statements || []).map((id, index) => {
                    const status = frames[id].ignore
                      ? 'ignored'
                      : requests[frames[id].requestId].status
                    const { titleProps, contentProps } = getChildProps({
                      index,
                      defaultActive: ['error'].includes(status)
                    })
                    return (
                      <div>
                        <Accordion.Title {...titleProps}>
                          <PointerFrameCommand title={frames[id].cmd}>
                            {frames[id].cmd}
                          </PointerFrameCommand>
                          <FrameTitlebarButtonSection>
                            <StyledStatusSection title={`Status: ${status}`}>
                              {getIcon(status)}
                            </StyledStatusSection>
                          </FrameTitlebarButtonSection>
                        </Accordion.Title>
                        <Accordion.Content {...contentProps}>
                          <Summary
                            status={status}
                            request={requests[frames[id].requestId]}
                          />
                        </Accordion.Content>
                      </div>
                    )
                  })}
                </div>
              )
            }}
          />
        </ContentSizer>
      </WrapperCenter>
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
