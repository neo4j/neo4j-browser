import React, { Component } from 'react'
import { Resizable } from 'react-resizable'
import { Icon } from 'semantic-ui-react'
import { DetailsPaneComponent } from './DetailsPane'
import OverviewPane, { GraphStyle } from './OverviewPane'
import { VizItem } from './types'
import {
  StyledNodeInspectorContainer,
  OverflowContainer,
  StyledNodeInspectorTopMenuChevron
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
}

export type NodeInspectorPanelState = {
  expanded: boolean
}
export const defaultPanelWidth = (): number => window.innerWidth / 3.5
export class NodeInspectorPanel extends Component<
  NodeInspectorPanelProps,
  NodeInspectorPanelState
> {
  state: NodeInspectorPanelState = {
    expanded: true
  }

  togglePanel = (): void => {
    if (this.state.expanded) {
      this.props.setWidth(0)
    } else {
      this.props.setWidth(defaultPanelWidth())
    }
    this.setState({
      expanded: !this.state.expanded
    })
  }

  render(): JSX.Element {
    const { expanded } = this.state
    const { hoveredItem, selectedItem } = this.props

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
          onClick={this.togglePanel}
        >
          {expanded ? (
            <Icon name="chevron right" fontSize={32} />
          ) : (
            <Icon
              title="Click to expand the Node Properties display"
              name="chevron left"
            />
          )}
        </StyledNodeInspectorTopMenuChevron>

        {expanded && (
          <StyledNodeInspectorContainer
            width={this.props.width}
            height={this.props.frameHeight}
          >
            <Resizable
              width={this.props.width}
              height={300 /*doesn't matter but required prop */}
              resizeHandles={['w']}
              onResize={(_e, { size }) => this.props.setWidth(size.width)}
            >
              {/* React-resizeable requires it's first child to not have a height set, 
                  therefore we need this wrapping div */}
              <div>
                <OverflowContainer height={this.props.frameHeight}>
                  {shownEl.type === 'node' ||
                  shownEl.type === 'relationship' ? (
                    <DetailsPaneComponent
                      vizItem={shownEl}
                      graphStyle={this.props.graphStyle}
                      frameHeight={this.props.frameHeight}
                    />
                  ) : (
                    <OverviewPane
                      frameHeight={this.props.frameHeight}
                      graphStyle={this.props.graphStyle}
                      hasTruncatedFields={this.props.hasTruncatedFields}
                      selectLabel={this.props.selectLabel}
                      selectRelType={this.props.selectRelType}
                      stats={this.props.stats}
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
