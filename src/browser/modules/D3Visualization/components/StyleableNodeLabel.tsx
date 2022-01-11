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

import { GrassEditor } from './GrassEditor'
import { StyledLabel } from 'browser/modules/DBMSInfo/styled'
import { GraphStyle } from 'project-root/src/browser/modules/D3Visualization/graphStyle'
import { BasicNode } from 'services/bolt/boltMappings'

export type StyleableNodeLabelProps = {
  selectedLabel: {
    label: string
    propertyKeys: string[]
    count?: number
  }
  graphStyle: GraphStyle
  onClick?: () => void
  nodes: BasicNode[]
}
export function StyleableNodeLabel({
  graphStyle,
  selectedLabel,
  onClick,
  nodes
}: StyleableNodeLabelProps): JSX.Element {
  const labels = selectedLabel.label === '*' ? [] : [selectedLabel.label]
  const graphStyleForLabel = graphStyle.forNode({
    labels: labels
  })
  const [open, wrapperRef, handleClick] = usePopupControlled(onClick)
  return (
    <Popup
      on="click"
      basic
      pinned
      key={selectedLabel.label}
      open={open}
      trigger={
        <StyledLabel
          onClick={handleClick}
          style={{
            backgroundColor: graphStyleForLabel.get('color'),
            color: graphStyleForLabel.get('text-color-internal')
          }}
          data-testid={`property-details-overview-node-label-${selectedLabel.label}`}
        >
          {selectedLabel.count !== undefined
            ? `${selectedLabel.label} (${selectedLabel.count})`
            : `${selectedLabel.label}`}
        </StyledLabel>
      }
      wide
    >
      <div ref={wrapperRef}>
        <GrassEditor selectedLabel={selectedLabel} nodes={nodes} />
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
