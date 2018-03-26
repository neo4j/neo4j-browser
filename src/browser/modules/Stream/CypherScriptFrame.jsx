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
import FrameTemplate from './FrameTemplate'
import { PaddedDiv } from './styled'
import { getRequest } from 'shared/modules/requests/requestsDuck'
import { getFrame } from 'shared/modules/stream/streamDuck'

const IgnoredRow = () => (
  <div style={{ backgroundColor: '#ccc' }}>
    <em>Ignored command</em>
  </div>
)
const CypherRow = ({ status }) => (
  <div style={{ backgroundColor: '#44aa22' }}>{status}</div>
)

const CypherScriptFrame = ({ frame, frames, params, requests = {} }) => {
  const contents = (
    <PaddedDiv>
      yo!
      {(frame.statements || []).map(id => {
        if (frames[id].ignore) {
          return <IgnoredRow />
        } else {
          return <CypherRow status={requests[frames[id].requestId].status} />
        }
      })}
    </PaddedDiv>
  )

  return <FrameTemplate header={frame} contents={contents} />
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
