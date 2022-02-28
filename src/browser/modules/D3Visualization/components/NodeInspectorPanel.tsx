import React, { Component } from 'react'
import { Resizable } from 'react-resizable'

import { GraphStats, GraphStyleModel, VizItem } from 'graph-visualization'

import { DetailsPaneComponent } from './DetailsPane'
import { NodeInspectorDrawer } from './NodeInspectorDrawer'
import OverviewPane from './OverviewPane'
import {
  PaneContainer,
  StyledNodeInspectorTopMenuChevron,
  panelMinWidth
} from './styled'
import {
  ChevronLeftIcon,
  ChevronRightIcon
} from 'browser-components/icons/Icons'

interface NodeInspectorPanelProps {
  expanded: boolean
  graphStyle: GraphStyleModel
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
          title={
            expanded
              ? 'Collapse the Node Properties display'
              : 'Expand the Node Properties display'
          }
        >
          {expanded ? <ChevronRightIcon /> : <ChevronLeftIcon />}
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
                  relationshipCount={
                    shownEl.type === 'canvas'
                      ? shownEl.item.relationshipCount
                      : null
                  }
                  infoMessage={
                    shownEl.type === 'status-item' ? shownEl.item : null
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
