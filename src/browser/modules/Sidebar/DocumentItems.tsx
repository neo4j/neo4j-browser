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
import React, { Dispatch, useState } from 'react'
import { connect } from 'react-redux'
import { Action } from 'redux'
import styled from 'styled-components'

import {
  HollowPlayIcon,
  SavedScriptsCollapseMenuIcon,
  SavedScriptsExpandMenuRightIcon
} from 'browser-components/icons/LegacyIcons'

import {
  StyledCommand,
  StyledCommandListItem,
  StyledCommandNamePair,
  StyledHelpItem,
  StyledName,
  StyledCommandRunButton,
  StyledCommandRowWrapper,
  FlexSpacer
} from './styled'
import { SavedScriptsFolderCollapseIcon } from 'browser-components/SavedScripts/styled'
import {
  DrawerExternalLink,
  DrawerSection,
  DrawerSectionBody,
  DrawerSubHeader
} from 'browser-components/drawer/drawer-styled'
import {
  commandSources,
  executeCommand
} from 'shared/modules/commands/commandsDuck'

const DrawerSubHeaderWithMargin = styled(DrawerSubHeader)`
  margin: 0 24px 0 24px;
`

type DocumentItemsOwnProps = {
  expandable?: true
  header: string
  items: (Link | Command)[]
}

type DocumentItemsProps = DocumentItemsOwnProps & {
  executeCommand: (item: string) => void
}

type Link = {
  name: string
  url: string
}

type Command = {
  name: string
  command: string
}

export const DocumentItems = ({
  expandable,
  header,
  items,
  executeCommand
}: DocumentItemsProps): JSX.Element => {
  const [expanded, setExpanded] = useState(false)

  const listOfItems = items.map(item =>
    'url' in item ? (
      <StyledHelpItem key={item.url}>
        <DrawerExternalLink href={item.url}>{item.name}</DrawerExternalLink>
      </StyledHelpItem>
    ) : (
      <CommandItem
        key={item.command}
        name={item.name}
        command={item.command}
        executeCommand={executeCommand}
      />
    )
  )

  return (
    <DrawerSection>
      <DrawerSubHeaderWithMargin
        onClick={() => expandable && setExpanded(!expanded)}
        style={{ cursor: expandable ? 'pointer' : 'auto' }}
      >
        {expandable && (
          <SavedScriptsFolderCollapseIcon>
            {expanded ? (
              <SavedScriptsCollapseMenuIcon />
            ) : (
              <SavedScriptsExpandMenuRightIcon />
            )}
          </SavedScriptsFolderCollapseIcon>
        )}
        {header}
      </DrawerSubHeaderWithMargin>
      {(!expandable || expanded) && (
        <DrawerSectionBody>
          <ul>{listOfItems}</ul>
        </DrawerSectionBody>
      )}
    </DrawerSection>
  )
}

type CommandItemProps = Command & { executeCommand: (cmd: string) => void }
const CommandItem = ({ name, command, executeCommand }: CommandItemProps) => {
  const [showRunButton, setShowRunButton] = useState(false)

  return (
    <StyledCommandListItem
      onClick={() => executeCommand(command)}
      onMouseEnter={() => setShowRunButton(true)}
      onMouseLeave={() => setShowRunButton(false)}
    >
      <StyledCommandRowWrapper>
        <StyledCommandNamePair>
          <StyledName> {name} </StyledName>
          <StyledCommand> {command} </StyledCommand>
        </StyledCommandNamePair>
        <FlexSpacer />
        <StyledCommandRunButton hidden={!showRunButton}>
          <HollowPlayIcon width={20} />
        </StyledCommandRunButton>
      </StyledCommandRowWrapper>
    </StyledCommandListItem>
  )
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  executeCommand: (cmd: string) => {
    dispatch(
      executeCommand(cmd, {
        source: commandSources.sidebar
      })
    )
  }
})

export default connect(null, mapDispatchToProps)(DocumentItems)
