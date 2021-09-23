import React, { Component } from 'react'
import { Resizable } from 'react-resizable'
import { Icon } from 'semantic-ui-react'
import { DetailsPaneComponent } from './DetailsPane'
import OverviewPane, { GraphStyle } from './OverviewPane'
import { VizItem } from './types'
import {
  StyledNodeInspectorContainer,
  OverflowContainer,
  StyledNodeInspectorTopMenuChevron,
  panelMinWidth
} from './styled'

interface NodeInspectorPanelProps {
  hoveredItem: VizItem
  selectedItem: VizItem
  stats: any
  graphStyle: GraphStyle
  selectLabel: (label: string, propertyKeys: string[]) => void
  selectRelType: (relType: string, propertyKeys: string[]) => void
  frameHeight: number
  hasTruncatedFields: boolean
  width: number
  setWidth: (width: number) => void
  expanded: boolean
  toggleExpanded: () => void
}

export type NodeInspectorPanelState = {
  expanded: boolean
}
export const defaultPanelWidth = (): number =>
  Math.max(window.innerWidth / 3.5, panelMinWidth)
export class NodeInspectorPanel extends Component<NodeInspectorPanelProps> {
  render(): JSX.Element {
    const {
      expanded,
      frameHeight,
      graphStyle,
      hasTruncatedFields,
      hoveredItem,
      selectLabel,
      selectRelType,
      selectedItem,
      stats,
      setWidth,
      toggleExpanded,
      width
    } = this.props

    const relevantItems = ['node', 'relationship']
    const hoveringNodeOrRelationship =
      hoveredItem && relevantItems.includes(hoveredItem.type)
    const shownEl = hoveringNodeOrRelationship ? hoveredItem : selectedItem
    const selectedLegendItem =
      selectedItem.type === 'legend-item' ? selectedItem : undefined

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
          <StyledNodeInspectorContainer width={width} height={frameHeight}>
            <Resizable
              width={width}
              height={300 /*doesn't matter but required prop */}
              resizeHandles={['w']}
              onResize={(_e, { size }) => setWidth(size.width)}
            >
              {/* React-resizeable requires it's first child to not have a height set, 
                  therefore we need this wrapping div */}
              <div>
                <OverflowContainer height={frameHeight}>
                  {shownEl.type === 'node' ||
                  shownEl.type === 'relationship' ? (
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
                      selectLabel={selectLabel}
                      selectRelType={selectRelType}
                      stats={stats}
                      legendItem={selectedLegendItem}
                      nodeCount={
                        shownEl.type === 'canvas'
                          ? shownEl.item.nodeCount
                          : null
                      }
                      relationshipCount={
                        shownEl.type === 'canvas'
                          ? shownEl.item.relationshipCount
                          : null
                      }
                    />
                  )}
                </OverflowContainer>
              </div>
            </Resizable>
          </StyledNodeInspectorContainer>
        )}
      </>
    )
  }
}
