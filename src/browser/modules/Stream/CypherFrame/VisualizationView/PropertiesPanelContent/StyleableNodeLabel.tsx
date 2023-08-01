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
import { Popup } from 'semantic-ui-react'

import { StyledLabelChip } from 'neo4j-arc/common'
import { GraphStyleModel } from 'neo4j-arc/graph-visualization'

import { GrassEditor } from './GrassEditor'
import { RelationshipModel } from 'neo4j-arc/graph-visualization/models/Relationship'
import { NodeModel } from 'neo4j-arc/graph-visualization/models/Node'
import { useTheme } from 'styled-components'

export type StyleableNodeLabelProps = {
  selectedLabel: {
    label: string
    propertyKeys: string[]
    count?: number
  }
  graphStyle: GraphStyleModel
  /* The total number of nodes in returned graph */
  allNodesCount?: number | null
  onClick?: () => void
  nodes: NodeModel[]
  relationships: RelationshipModel[]
}
export function StyleableNodeLabel({
  graphStyle,
  selectedLabel,
  allNodesCount,
  onClick,
  nodes,
  relationships
}: StyleableNodeLabelProps): JSX.Element {
  const labels = selectedLabel.label === '*' ? [] : [selectedLabel.label]
  const graphStyleForLabel = graphStyle.forNode({
    labels: labels
  })
  const count =
    selectedLabel.label === '*' ? allNodesCount : selectedLabel.count

  const [open, wrapperRef, handleClick] = usePopupControlled(onClick)
  const theme = useTheme()
  // console.log(theme)
  return (
    <Popup
      style={React.useMemo(
        //@ts-ignore
        () => ({ backgroundColor: theme.editorBackground }),
        []
      )}
      on="click"
      basic
      key={selectedLabel.label}
      wide
      position="left center"
      offset={[0, 0]}
      open={open}
      trigger={
        <StyledLabelChip
          onClick={handleClick}
          style={{
            backgroundColor: graphStyleForLabel.get('color'),
            color: graphStyleForLabel.get('text-color-internal')
          }}
          data-testid={`property-details-overview-node-label-${selectedLabel.label}`}
        >
          {`${selectedLabel.label}${count || count === 0 ? ` (${count})` : ''}`}
        </StyledLabelChip>
      }
    >
      <div ref={wrapperRef}>
        <GrassEditor
          selectedLabel={selectedLabel}
          nodes={nodes}
          relationships={relationships}
        />
      </div>
    </Popup>
  )
}

export function usePopupControlled(
  onClick?: () => void
): [boolean, React.Ref<HTMLDivElement>, () => void] {
  const [open, setOpen] = React.useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const handleClick = React.useCallback(() => {
    setOpen(t => !t)
    if (onClick) {
      onClick()
    }
  }, [onClick])
  React.useEffect(() => {
    function handleClickOutside(event: any) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target) &&
        document.querySelector('.ReactModal__Overlay') === null
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [wrapperRef])

  return [open, wrapperRef, handleClick]
}
