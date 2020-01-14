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
import { escapeCypherIdentifier } from 'services/utils'
import classNames from 'classnames'
import styles from './style_meta.css'
import {
  DrawerSubHeader,
  DrawerSection,
  DrawerSectionBody
} from 'browser-components/drawer'
import {
  StyledLabel,
  StyledRelationship,
  StyledProperty,
  StyledShowMoreContainer,
  StyledShowMoreLink
} from './styled'
import Render from 'browser-components/Render'
import numberToUSLocale from 'shared/utils/number-to-US-locale'

const wrapperStyleObj =
  styles && styles.wrapper
    ? {
        [styles.wrapper]: true
      }
    : {}

const ShowMore = ({ total, shown, moreStep, onMore }) => {
  const numMore = total - shown > moreStep ? moreStep : total - shown
  return (
    <Render if={shown < total}>
      <StyledShowMoreContainer>
        <StyledShowMoreLink onClick={() => onMore(numMore)}>
          Show {numMore} more
        </StyledShowMoreLink>
        &nbsp;|&nbsp;
        <StyledShowMoreLink onClick={() => onMore(total)}>
          Show all
        </StyledShowMoreLink>
      </StyledShowMoreContainer>
    </Render>
  )
}

const createItems = (
  originalList,
  onItemClick,
  RenderType,
  editorCommandTemplate,
  showStar = true,
  count
) => {
  const items = [...originalList]
  if (showStar) {
    let str = '*'
    if (count) {
      str = `${str}(${numberToUSLocale(count)})`
    }
    items.unshift(str)
  }
  return items.map((text, index) => {
    const getNodesCypher = editorCommandTemplate(text, index)
    return (
      <RenderType.component
        data-testid="sidebarMetaItem"
        key={index}
        onClick={() => onItemClick(getNodesCypher)}
      >
        {text}
      </RenderType.component>
    )
  })
}
const LabelItems = ({
  labels = [],
  totalNumItems,
  onItemClick,
  moreStep,
  onMoreClick,
  count
}) => {
  let labelItems = <p>There are no labels in database</p>
  if (labels.length) {
    const editorCommandTemplate = (text, i) => {
      if (i === 0) {
        return 'MATCH (n) RETURN n LIMIT 25'
      }
      return `MATCH (n:${escapeCypherIdentifier(text)}) RETURN n LIMIT 25`
    }
    labelItems = createItems(
      labels,
      onItemClick,
      { component: StyledLabel },
      editorCommandTemplate,
      true,
      count
    )
  }
  return (
    <DrawerSection>
      <DrawerSubHeader>Node Labels</DrawerSubHeader>
      <DrawerSectionBody className={classNames(wrapperStyleObj)}>
        {labelItems}
      </DrawerSectionBody>
      <ShowMore
        total={totalNumItems}
        shown={labels.length}
        moreStep={moreStep}
        onMore={onMoreClick}
      />
    </DrawerSection>
  )
}
const RelationshipItems = ({
  relationshipTypes = [],
  totalNumItems,
  onItemClick,
  moreStep,
  onMoreClick,
  count
}) => {
  let relationshipItems = <p>No relationships in database</p>
  if (relationshipTypes.length > 0) {
    const editorCommandTemplate = (text, i) => {
      if (i === 0) {
        return 'MATCH p=()-->() RETURN p LIMIT 25'
      }
      return `MATCH p=()-[r:${escapeCypherIdentifier(
        text
      )}]->() RETURN p LIMIT 25`
    }
    relationshipItems = createItems(
      relationshipTypes,
      onItemClick,
      { component: StyledRelationship },
      editorCommandTemplate,
      true,
      count
    )
  }
  return (
    <DrawerSection>
      <DrawerSubHeader>Relationship Types</DrawerSubHeader>
      <DrawerSectionBody className={classNames(wrapperStyleObj)}>
        {relationshipItems}
      </DrawerSectionBody>
      <ShowMore
        total={totalNumItems}
        shown={relationshipTypes.length}
        moreStep={moreStep}
        onMore={onMoreClick}
      />
    </DrawerSection>
  )
}
const PropertyItems = ({
  properties,
  totalNumItems,
  onItemClick,
  moreStep,
  onMoreClick
}) => {
  let propertyItems = <p>There are no properties in database</p>
  if (properties.length > 0) {
    const editorCommandTemplate = text => {
      return `MATCH (n) WHERE EXISTS(n.${escapeCypherIdentifier(
        text
      )}) RETURN DISTINCT "node" as entity, n.${escapeCypherIdentifier(
        text
      )} AS ${escapeCypherIdentifier(
        text
      )} LIMIT 25 UNION ALL MATCH ()-[r]-() WHERE EXISTS(r.${escapeCypherIdentifier(
        text
      )}) RETURN DISTINCT "relationship" AS entity, r.${escapeCypherIdentifier(
        text
      )} AS ${escapeCypherIdentifier(text)} LIMIT 25`
    }
    propertyItems = createItems(
      properties,
      onItemClick,
      { component: StyledProperty },
      editorCommandTemplate,
      false
    )
  }
  return (
    <DrawerSection>
      <DrawerSubHeader>Property Keys</DrawerSubHeader>
      <DrawerSectionBody className={classNames(wrapperStyleObj)}>
        {propertyItems}
      </DrawerSectionBody>
      <ShowMore
        total={totalNumItems}
        shown={properties.length}
        moreStep={moreStep}
        onMore={onMoreClick}
      />
    </DrawerSection>
  )
}

export { LabelItems, RelationshipItems, PropertyItems }
