/*
 * Copyright (c) 2002-2019 "Neo4j,"
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
import { SET_CONTENT, setContent } from 'shared/modules/editor/editorDuck'
import {
  DrawerSubHeader,
  DrawerSection,
  DrawerSectionBody
} from 'browser-components/drawer'
import {
  StyledHelpLink,
  StyledHelpItem,
  StyledDocumentActionLink
} from './styled'

export const DocumentItems = ({ header, items, onItemClick = null }) => {
  const listOfItems = items.map(item => {
    switch (item.type) {
      case 'link':
        return (
          <StyledHelpItem key={item.command}>
            <StyledHelpLink href={item.command} target='_blank'>
              {item.name}
            </StyledHelpLink>
          </StyledHelpItem>
        )
      default:
        return (
          <StyledDocumentActionLink
            key={item.command}
            onClick={() => onItemClick(item.command)}
            name={item.name}
            type={item.type}
          />
        )
    }
  })
  return (
    <DrawerSection>
      <DrawerSubHeader>{header}</DrawerSubHeader>
      <DrawerSectionBody>
        <ul className='document'>{listOfItems}</ul>
      </DrawerSectionBody>
    </DrawerSection>
  )
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onItemClick: cmd => {
      ownProps.bus.send(SET_CONTENT, setContent(cmd))
    }
  }
}

export default withBus(
  connect(
    null,
    mapDispatchToProps
  )(DocumentItems)
)
