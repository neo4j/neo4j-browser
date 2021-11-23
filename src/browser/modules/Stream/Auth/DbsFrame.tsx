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

import React from 'react'
import FrameTemplate from 'browser/modules/Frame/FrameTemplate'
import {
  StyledConnectionAside,
  StyledConnectionBodyContainer,
  StyledConnectionBody,
  StyledDbsRow
} from './styled'
import { H3 } from 'browser-components/headers'
import { toKeyString, escapeCypherIdentifier } from 'services/utils'
import { AliasText, UnstyledList } from '../styled'
import { useDbCommand } from 'shared/modules/commands/commandsDuck'
import TextCommand from 'browser/modules/DecoratedText/TextCommand'
import ClickToCode from 'browser/modules/ClickToCode/index'
import { StyledCodeBlockFrame } from 'browser/modules/Main/styled'
import { uniqBy } from 'lodash-es'
import { BaseFrameProps } from '../Stream'

const DbsFrame = (props: BaseFrameProps) => {
  const { frame } = props
  const { dbs = [] } = frame
  const dbsToShow = uniqBy(dbs, 'name')

  return (
    <>
      <StyledConnectionAside>
        <span>
          <React.Fragment>
            <H3>Available databases</H3>
            Databases available for the current user.
          </React.Fragment>
        </span>
      </StyledConnectionAside>
      <StyledConnectionBodyContainer>
        <StyledConnectionBody>
          {dbsToShow.length ? (
            <>
              Click on one to start using it:
              <UnstyledList data-testid="dbs-command-list">
                {dbsToShow.map(db => {
                  return (
                    <StyledDbsRow key={toKeyString(db.name)}>
                      <TextCommand
                        command={`${useDbCommand} ${escapeCypherIdentifier(
                          db.name
                        )}`}
                      />
                      {db.aliases && db.aliases.length > 0 && (
                        <AliasText>
                          Configured aliases:{' '}
                          {db.aliases.map(name => (
                            <TextCommand
                              key={name}
                              command={`${useDbCommand} ${escapeCypherIdentifier(
                                name
                              )}`}
                            />
                          ))}
                        </AliasText>
                      )}
                    </StyledDbsRow>
                  )
                })}
              </UnstyledList>
            </>
          ) : (
            <>
              <div>
                Either you don't have permission to list available databases or
                the dbms you're connected to don't support multiple databases.
              </div>
              <div>
                If you know you have access to a database with a certain name,
                you can use the{' '}
                <ClickToCode CodeComponent={StyledCodeBlockFrame}>
                  {`:${useDbCommand} databaseName`}
                </ClickToCode>{' '}
                command to start using it.
              </div>
            </>
          )}
        </StyledConnectionBody>
      </StyledConnectionBodyContainer>
    </>
  )
}

const Frame = (props: BaseFrameProps): JSX.Element => {
  return (
    <FrameTemplate header={props.frame} contents={<DbsFrame {...props} />} />
  )
}

export default Frame
