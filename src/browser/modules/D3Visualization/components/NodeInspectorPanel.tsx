import React, { Component } from 'react'
import { Resizable } from 'react-resizable'
import { Icon } from 'semantic-ui-react'
import { DetailsPaneComponent } from './DetailsPane'
import ResultsPane from './ResultsPane'
import {
  StyledNodeInspectorContainer,
  StyledNodeInspectorPane,
  StyledNodeInspectorTopMenu,
  StyledNodeInspectorTopMenuChevron
} from './styled'
import { VizItem } from './types'

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
  showResults: boolean
  width: number
}
export class NodeInspectorPanel extends Component<
  NodeInspectorPanelProps,
  NodeInspectorPanelState
> {
  state: NodeInspectorPanelState = {
    expanded: true,
    showResults: true,
    width: 300
  }

  togglePanel = (): void => {
    this.setState(oldState => ({
      expanded: !oldState.expanded
    }))
  }

  render(): JSX.Element {
    const { expanded, showResults } = this.state
    const { hoveredItem, selectedItem } = this.props

    const shouldShowResult =
      showResults &&
      !['node', 'relationship'].includes(hoveredItem.type) &&
      !['node', 'relationship'].includes(selectedItem.type)

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
                <StyledNodeInspectorTopMenu>
                  <StyledNodeInspectorPane
                    isActive={shouldShowResult}
                    onClick={e => {
                      e.stopPropagation()
                      this.setState({ showResults: true })
                    }}
                  >
                    Results
                  </StyledNodeInspectorPane>
                  <StyledNodeInspectorPane
                    isActive={!shouldShowResult}
                    onClick={e => {
                      e.stopPropagation()
                      this.setState({ showResults: false })
                    }}
                  >
                    Details
                  </StyledNodeInspectorPane>
                </StyledNodeInspectorTopMenu>
                <div style={{ height: this.props.frameHeight }}>
                  {shouldShowResult ? (
                    <ResultsPane
                      stats={this.props.stats}
                      graphStyle={this.props.graphStyle}
                      onSelectedLabel={this.props.onSelectedLabel}
                      onSelectedRelType={this.props.onSelectedRelType}
                      selectedLabel={this.props.selectedLabel}
                      frameHeight={this.props.frameHeight}
                    />
                  ) : (
                    <DetailsPaneComponent
                      hasTruncatedFields={this.props.hasTruncatedFields}
                      hoveredItem={this.props.hoveredItem}
                      selectedItem={this.props.selectedItem}
                      graphStyle={this.props.graphStyle}
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
