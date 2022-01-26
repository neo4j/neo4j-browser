import React, { Component } from 'react'
import { Resizable } from 'react-resizable'
import { Icon } from 'semantic-ui-react'

import { GraphStats } from '../mapper'
import { DetailsPaneComponent } from './DetailsPane'
import { NodeInspectorDrawer } from './NodeInspectorDrawer'
import OverviewPane from './OverviewPane'
import {
  PaneContainer,
  StyledNodeInspectorTopMenuChevron,
  panelMinWidth
} from './styled'
import { VizItem } from './types'
import { GraphStyle } from 'project-root/src/browser/modules/D3Visualization/graphStyle'
import VizNode from 'project-root/src/browser/modules/D3Visualization/lib/visualization/components/VizNode'

interface NodeInspectorPanelProps {
  expanded: boolean
  graphStyle: GraphStyle
  hasTruncatedFields: boolean
  hoveredItem: VizItem
  selectedItem: VizItem
  setWidth: (width: number) => void
  stats: GraphStats
  toggleExpanded: () => void
  width: number
  nodes: VizNode[]
}

export const defaultPanelWidth = (): number =>
  Math.max(window.innerWidth / 5, panelMinWidth)
export class NodeInspectorPanel extends Component<NodeInspectorPanelProps> {
  render(): JSX.Element {
    const {
      expanded,
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
                  nodes={this.props.nodes}
                  graphStyle={graphStyle}
                  nodeInspectorWidth={width}
                />
              ) : (
                <OverviewPane
                  graphStyle={graphStyle}
                  hasTruncatedFields={hasTruncatedFields}
                  stats={stats}
                  nodeCount={
                    shownEl.type === 'canvas' ? shownEl.item.nodeCount : null
                  }
                  nodes={this.props.nodes}
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
