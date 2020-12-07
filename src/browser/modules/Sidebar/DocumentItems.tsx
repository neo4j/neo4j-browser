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
import React from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import {
  DrawerSubHeader,
  DrawerSection,
  DrawerSectionBody
} from 'browser-components/drawer'
import { StyledHelpLink, StyledHelpItem, StyledDocumentText } from './styled'
import {
  commandSources,
  executeCommand
} from 'shared/modules/commands/commandsDuck'
import { Bus } from 'suber'

type DocumentItemsOwnProps = {
  header: string
  items: (Link | Command)[]
  bus: Bus
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
  header,
  items,
  executeCommand
}: DocumentItemsProps): JSX.Element => {
  const listOfItems = items.map(item =>
    'url' in item ? (
      <StyledHelpItem key={item.url}>
        <StyledHelpLink href={item.url} target="_blank" rel="noreferrer">
          {item.name}
        </StyledHelpLink>
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
      <DrawerSubHeader>{header}</DrawerSubHeader>
      <DrawerSectionBody>
        <ul className="document">{listOfItems}</ul>
      </DrawerSectionBody>
    </DrawerSection>
  )
}

type CommandItemProps = Command & { executeCommand: (cmd: string) => void }

const CommandItem = ({ name }: CommandItemProps) => (
  <StyledHelpItem>
    <StyledDocumentText>
      &nbsp;
      {name}
    </StyledDocumentText>
  </StyledHelpItem>
)

const mapDispatchToProps = (
  _dispatch: any,
  ownProps: DocumentItemsOwnProps
) => ({
  executeCommand: (cmd: string) => {
    const action = executeCommand(cmd, {
      source: commandSources.sidebar
    })
    ownProps.bus.send(action.type, action)
  }
})

export default withBus(connect(null, mapDispatchToProps)(DocumentItems))
