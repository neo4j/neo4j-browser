import React, { Component } from 'react'
import { Resizable } from 'react-resizable'
import { Icon } from 'semantic-ui-react'
import { DetailsPaneComponent } from './DetailsPane'
import ResultsPane from './ResultsPane'
import { VizItem } from './types'
import {
  StyledNodeInspectorContainer,
  StyledNodeInspectorPane,
  StyledNodeInspectorTopMenu,
  StyledNodeInspectorTopMenuChevron
} from './styled'

interface NodeInspectorPanelProps {
  hoveredItem: VizItem
  selectedItem: VizItem
  stats: any
  graphStyle: any
  onSelectedLabel: any
  onSelectedRelType: any
  selectedLabel: any
  frameHeight: number
  hasTruncatedFields: boolean
}

export type NodeInspectorPanelState = {
  expanded: boolean
  width: number
}
export class NodeInspectorPanel extends Component<
  NodeInspectorPanelProps,
  NodeInspectorPanelState
> {
  state: NodeInspectorPanelState = {
    expanded: true,
    width: 300
  }

  togglePanel = (): void => {
    this.setState(oldState => ({
      expanded: !oldState.expanded
    }))
  }

  render(): JSX.Element {
    const { expanded } = this.state
    const { hoveredItem, selectedItem } = this.props

    const relevantItems = ['node', 'relationship']
    const hoveringNodeOrRelationship =
      hoveredItem && relevantItems.includes(hoveredItem.type)
    const shownEl = hoveringNodeOrRelationship ? hoveredItem : selectedItem
    const showDetails = relevantItems.includes(shownEl.type)

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
            width={this.state.width}
            height={this.props.frameHeight}
          >
            <Resizable
              width={this.state.width}
              height={300 /*doesn't matter but required prop */}
              resizeHandles={['w']}
              onResize={(_e, { size }) => this.setState({ width: size.width })}
            >
              <div>
                <div style={{ height: this.props.frameHeight }}>
                  {showDetails ? (
                    <DetailsPaneComponent
                      vizItem={shownEl}
                      graphStyle={this.props.graphStyle}
                    />
                  ) : (
                    <ResultsPane
                      frameHeight={this.props.frameHeight}
                      graphStyle={this.props.graphStyle}
                      hasTruncatedFields={this.props.hasTruncatedFields}
                      onSelectedLabel={this.props.onSelectedLabel}
                      onSelectedRelType={this.props.onSelectedRelType}
                      selectedLabel={this.props.selectedLabel}
                      stats={this.props.stats}
                    />
                  )}
                </div>
              </div>
            </Resizable>
          </StyledNodeInspectorContainer>
        )}
      </>
    )
  }
}
