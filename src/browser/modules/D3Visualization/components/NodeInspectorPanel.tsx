import React, { Component } from 'react'
import { Resizable } from 'react-resizable'
import { Icon } from 'semantic-ui-react'

import OverviewPane, { GraphStyle } from './OverviewPane'
import { DetailsPaneComponent } from './DetailsPane'
import { GraphStats } from '../mapper'
import {
  PaneContainer,
  StyledNodeInspectorTopMenuChevron,
  panelMinWidth
} from './styled'
import { VizItem } from './types'
import { NodeInspectorDrawer } from './NodeInspectorDrawer'

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

        <NodeInspectorDrawer width={width} isOpen={expanded}>
          <Resizable
            width={width}
            data-testid="vizInspector"
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
                  nodeInspectorWidth={width}
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
        </NodeInspectorDrawer>
      </>
    )
  }
}
