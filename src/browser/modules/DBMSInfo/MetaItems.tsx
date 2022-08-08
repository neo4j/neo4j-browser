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
import deepmerge from 'deepmerge'
import React from 'react'
import { ThemeProvider } from 'styled-components'

import {
  numberToUSLocale,
  StyledLabelChip,
  StyledPropertyChip,
  StyledRelationshipChip,
  ShowMoreOrAll
} from 'neo4j-arc/common'
import { GraphStyleModel } from 'neo4j-arc/graph-visualization'

import styles from './style_meta.css'
import {
  DrawerSection,
  DrawerSectionBody,
  DrawerSubHeader
} from 'browser-components/drawer/drawer-styled'
import { dark } from 'browser-styles/themes'
import { escapeCypherIdentifier } from 'services/utils'

const wrapperStyle = (styles && styles.wrapper) || ''

function createStyleGetter(graphStyleData: any, kind: string) {
  const graphStyle = new GraphStyleModel()
  if (graphStyleData) {
    graphStyle.loadRules(deepmerge(graphStyle.toSheet(), graphStyleData || {}))
  }

  if (kind === 'node') {
    return function (text: string) {
      if (graphStyleData) {
        const styleForItem = graphStyle.forNode({
          labels: [text]
        })
        return {
          backgroundColor: styleForItem.get('color'),
          color: styleForItem.get('text-color-internal')
        }
      }
      return {}
    }
  }
  if (kind === 'relationship') {
    return function (text: string) {
      if (graphStyleData) {
        const styleForItem = graphStyle.forRelationship({
          type: text
        })
        return {
          backgroundColor: styleForItem.get('color'),
          color: styleForItem.get('text-color-internal')
        }
      }
      return {}
    }
  }
  throw new Error(`Unsupported argument: ${kind}`)
}
function createNodeStyleGetter(graphStyleData: any) {
  return createStyleGetter(graphStyleData, 'node')
}
function createRelationshipStyleGetter(graphStyleData: any) {
  return createStyleGetter(graphStyleData, 'relationship')
}

const createItems = (
  originalList: any,
  onItemClick: any,
  RenderType: any,
  editorCommandTemplate: any,
  showStar = true,
  count?: number,
  styleGetter: any = () => ({})
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
        style={styleGetter(text)}
      >
        {text}
      </RenderType.component>
    )
  })
}

type LabelItemsProps = {
  labels: string[]
  totalNumItems: number
  onItemClick: () => void
  moreStep: number
  onMoreClick: (num: number) => void
  count: number
  graphStyleData: any
}
const LabelItems = ({
  labels = [],
  totalNumItems,
  onItemClick,
  moreStep,
  onMoreClick,
  count,
  graphStyleData
}: LabelItemsProps) => {
  let labelItems: any = <p>There are no labels in database</p>
  if (labels.length) {
    const editorCommandTemplate = (text: any, i: any) => {
      if (i === 0) {
        return 'MATCH (n) RETURN n LIMIT 25'
      }
      return `MATCH (n:${escapeCypherIdentifier(text)}) RETURN n LIMIT 25`
    }
    labelItems = createItems(
      labels,
      onItemClick,
      { component: StyledLabelChip },
      editorCommandTemplate,
      true,
      count,
      createNodeStyleGetter(graphStyleData)
    )
  }
  return (
    <DrawerSection>
      <DrawerSubHeader>Node labels</DrawerSubHeader>
      <DrawerSectionBody className={wrapperStyle}>
        {labelItems}
      </DrawerSectionBody>
      <ThemeProvider theme={dark}>
        <ShowMoreOrAll
          total={totalNumItems}
          shown={labels.length}
          moreStep={moreStep}
          onMore={onMoreClick}
        />
      </ThemeProvider>
    </DrawerSection>
  )
}

type RelationshipItemsProps = {
  relationshipTypes: string[]
  totalNumItems: number
  onItemClick: () => void
  moreStep: number
  onMoreClick: (num: number) => any
  count: number
  graphStyleData: any
}
const RelationshipItems = ({
  relationshipTypes = [],
  totalNumItems,
  onItemClick,
  moreStep,
  onMoreClick,
  count,
  graphStyleData
}: RelationshipItemsProps) => {
  let relationshipItems: any = <p>No relationships in database</p>
  if (relationshipTypes.length > 0) {
    const editorCommandTemplate = (text: any, i: any) => {
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
      { component: StyledRelationshipChip },
      editorCommandTemplate,
      true,
      count,
      createRelationshipStyleGetter(graphStyleData)
    )
  }
  return (
    <DrawerSection>
      <DrawerSubHeader>Relationship types</DrawerSubHeader>
      <DrawerSectionBody className={wrapperStyle}>
        {relationshipItems}
      </DrawerSectionBody>
      <ShowMoreOrAll
        total={totalNumItems}
        shown={relationshipTypes.length}
        moreStep={moreStep}
        onMore={onMoreClick}
      />
    </DrawerSection>
  )
}

type PropertyItemsProps = {
  properties: string[]
  totalNumItems: number
  onItemClick: () => void
  moreStep: number
  onMoreClick: (num: number) => any
}
const PropertyItems = ({
  properties,
  totalNumItems,
  onItemClick,
  moreStep,
  onMoreClick
}: PropertyItemsProps) => {
  let propertyItems: any = <p>There are no properties in database</p>
  if (properties.length > 0) {
    const editorCommandTemplate = (text: any) => {
      return `MATCH (n) WHERE (n.${escapeCypherIdentifier(text)}) IS NOT NULL 
RETURN DISTINCT "node" as entity, n.${escapeCypherIdentifier(
        text
      )} AS ${escapeCypherIdentifier(text)} LIMIT 25 
UNION ALL 
MATCH ()-[r]-() WHERE (r.${escapeCypherIdentifier(text)}) IS NOT NULL 
RETURN DISTINCT "relationship" AS entity, r.${escapeCypherIdentifier(
        text
      )} AS ${escapeCypherIdentifier(text)} LIMIT 25`
    }
    propertyItems = createItems(
      properties,
      onItemClick,
      { component: StyledPropertyChip },
      editorCommandTemplate,
      false
    )
  }
  return (
    <DrawerSection>
      <DrawerSubHeader>Property keys</DrawerSubHeader>
      <DrawerSectionBody className={wrapperStyle}>
        {propertyItems}
      </DrawerSectionBody>
      <ShowMoreOrAll
        total={totalNumItems}
        shown={properties.length}
        moreStep={moreStep}
        onMore={onMoreClick}
      />
    </DrawerSection>
  )
}

export { LabelItems, RelationshipItems, PropertyItems }
