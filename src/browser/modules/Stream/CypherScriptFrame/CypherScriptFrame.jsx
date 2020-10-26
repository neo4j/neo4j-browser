/*
 * Copyright (c) 2002-2020 "Neo4j,"
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

import { connect } from 'react-redux'
import React, { Component } from 'react'
import FrameTemplate from '../../Frame/FrameTemplate'
import { getRequest } from 'shared/modules/requests/requestsDuck'
import { getFrame } from 'shared/modules/stream/streamDuck'
import { StyledStatusSection } from 'browser-components/buttons'

import { StyledFrameTitlebarButtonSection } from 'browser/modules/Frame/styled'
import { WrapperCenter, ContentSizer, PointerFrameCommand } from './styled'
import Accordion from 'browser-components/Accordion/Accordion'
import { Summary, CypherSummary } from './Summary'
import { Icon } from './Icon'
import { getLatestFromFrameStack } from '../stream.utils'

const isCypher = str => !str.startsWith(':')

class CypherScriptFrame extends Component {
  render() {
    const { frame, frames, requests = {} } = this.props
    const contents = (
      <WrapperCenter>
        <ContentSizer>
          <Accordion
            data-testid="multi-statement-list"
            render={({ getChildProps }) => {
              return (
                <div>
                  {(frame.statements || []).map((id, index) => {
                    if (!requests[frames[id].requestId]) {
                      return
                    }
                    const status = frames[id].ignore
                      ? 'ignored'
                      : requests[frames[id].requestId].status
                    const { titleProps, contentProps } = getChildProps({
                      index,
                      defaultActive: ['error'].includes(status)
                    })
                    const SummaryC = isCypher(frames[id].cmd)
                      ? CypherSummary
                      : Summary
                    return (
                      <div key={id}>
                        <Accordion.Title
                          data-testid="multi-statement-list-title"
                          {...titleProps}
                        >
                          <PointerFrameCommand title={frames[id].cmd}>
                            {frames[id].cmd}
                          </PointerFrameCommand>
                          <StyledFrameTitlebarButtonSection>
                            <StyledStatusSection
                              data-testid="multi-statement-list-icon"
                              title={`Status: ${status}`}
                            >
                              <Icon status={status} />
                            </StyledStatusSection>
                          </StyledFrameTitlebarButtonSection>
                        </Accordion.Title>
                        <Accordion.Content
                          data-testid="multi-statement-list-content"
                          {...contentProps}
                        >
                          <SummaryC
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
    return (
      <FrameTemplate
        className="no-padding"
        header={frame}
        contents={contents}
      />
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  if (!ownProps.frame.statements) return {}
  const frames = ownProps.frame.statements
    .map(id => getLatestFromFrameStack(getFrame(state, id)))
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
