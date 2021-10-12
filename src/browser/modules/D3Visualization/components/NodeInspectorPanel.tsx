import React, { Component } from 'react'
import { Resizable } from 'react-resizable'
import { Icon } from 'semantic-ui-react'

import OverviewPane, { GraphStyle } from './OverviewPane'
import { DetailsPaneComponent } from './DetailsPane'
import { GraphStats } from '../mapper'
import {
  StyledNodeInspectorContainer,
  PaneContainer,
  StyledNodeInspectorTopMenuChevron,
  panelMinWidth
} from './styled'
import { VizItem } from './types'

interface NodeInspectorPanelProps {
  expanded: boolean
  frameHeight: number
  graphStyle: GraphStyle
  hasTruncatedFields: boolean
  hoveredItem: VizItem
  selectedItem: VizItem
  setWidth: (width: number) => void
  stats: GraphStats
  toggleExpanded: () => void
  width: number
}

export type NodeInspectorPanelState = {
  expanded: boolean
}
export const defaultPanelWidth = (): number =>
  Math.max(window.innerWidth / 5, panelMinWidth)
export class NodeInspectorPanel extends Component<NodeInspectorPanelProps> {
  render(): JSX.Element {
    const {
      expanded,
      frameHeight,
      graphStyle,
      hasTruncatedFields,
      hoveredItem,
      selectedItem,
      setWidth,
      stats,
      toggleExpanded,
      width
    } = this.props

    const relevantItems = ['node', 'relationship']
    const hoveringNodeOrRelationship =
      hoveredItem && relevantItems.includes(hoveredItem.type)
    const shownEl = hoveringNodeOrRelationship ? hoveredItem : selectedItem

    return (
      <>
        <StyledNodeInspectorTopMenuChevron
          expanded={expanded}
          onClick={toggleExpanded}
        >
          {expanded ? (
            <Icon
              title="Collapse the Node Properties display"
              name="chevron right"
            />
          ) : (
            <Icon
              title="Expand the Node Properties display"
              name="chevron left"
            />
          )}
        </StyledNodeInspectorTopMenuChevron>

        {expanded && (
          <StyledNodeInspectorContainer
            width={width}
            data-testid="vizInspector"
          >
            <Resizable
              width={width}
              height={300 /*doesn't matter but required prop */}
              resizeHandles={['w']}
              onResize={(_e, { size }) => setWidth(size.width)}
            >
              <PaneContainer>
                {shownEl.type === 'node' || shownEl.type === 'relationship' ? (
                  <DetailsPaneComponent
                    vizItem={shownEl}
                    graphStyle={graphStyle}
                    frameHeight={frameHeight}
                  />
                ) : (
                  <OverviewPane
                    frameHeight={frameHeight}
                    graphStyle={graphStyle}
                    hasTruncatedFields={hasTruncatedFields}
                    stats={stats}
                    nodeCount={
                      shownEl.type === 'canvas' ? shownEl.item.nodeCount : null
                    }
                    relationshipCount={
                      shownEl.type === 'canvas'
                        ? shownEl.item.relationshipCount
                        : null
                    }
                  />
                )}
              </PaneContainer>
            </Resizable>
          </StyledNodeInspectorContainer>
        )}
      </>
    )
  }
}
