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
import { Component } from 'preact'
import { deepEquals } from 'services/utils'
import {
  StyledCypherMessage,
  StyledCypherWarningMessage,
  StyledCypherErrorMessage,
  StyledHelpContent,
  StyledH4,
  StyledPreformattedArea,
  StyledHelpDescription,
  StyledDiv,
  StyledBr,
  StyledHelpFrame
} from '../styled'

const getWarningComponent = severity => {
  if (severity === 'ERROR') {
    return <StyledCypherErrorMessage>{severity}</StyledCypherErrorMessage>
  } else if (severity === 'WARNING') {
    return <StyledCypherWarningMessage>{severity}</StyledCypherWarningMessage>
  } else {
    return <StyledCypherMessage>{severity}</StyledCypherMessage>
  }
}

export class WarningsView extends Component {
  shouldComponentUpdate (props, state) {
    if (!this.props.result) return true
    return !deepEquals(props.result.summary, this.props.result.summary)
  }
  render () {
    if (this.props.result === undefined) return null
    const { summary = {} } = this.props.result
    const { notifications = [], statement = {} } = summary
    const { text: cypher = '' } = statement
    if (!notifications || !cypher) {
      return null
    }

    let cypherLines = cypher.split('\n')
    cypherLines[0] = cypherLines[0].replace(/^EXPLAIN /, '')

    let notificationsList = notifications.map(notification => {
      return (
        <StyledHelpContent>
          <StyledHelpDescription>
            {getWarningComponent(notification.severity)}
            <StyledH4>{notification.title}</StyledH4>
          </StyledHelpDescription>
          <StyledDiv>
            <StyledHelpDescription>
              {notification.description}
            </StyledHelpDescription>
            <StyledDiv>
              <StyledPreformattedArea>
                {cypherLines[notification.position.line - 1]}
                <StyledBr />
                {Array(notification.position.column).join(' ')}^
              </StyledPreformattedArea>
            </StyledDiv>
          </StyledDiv>
        </StyledHelpContent>
      )
    })
    return <StyledHelpFrame>{notificationsList}</StyledHelpFrame>
  }
}

export class WarningsStatusbar extends Component {
  shouldComponentUpdate (props, state) {
    return false
  }
  render () {
    return null
  }
}
