import * as React from 'react'
import styled from 'styled-components'
import { flatten } from 'lodash-es'
import NeighboursPickerItem, {
  INeighboursPickerItem
} from './NeighboursPickerItem'
import { connect } from 'react-redux'
import { GlobalState } from 'shared/globalState'
import GenericModal from './GenericModal'
import { ApplyButton, SimpleButton } from './styled'

interface INeighbourNode {
  id: string
  labels: string[]
  properties: any
}

interface INeighbourRel {
  endNodeId: string
  id: string
  properties: any
  startNodeId: string
  type: string
}

export interface IDisplayRelMapItem {
  id: string
  type: string
  direction: 'IN' | 'OUT'
  node?: INeighbourNode
}

interface IDisplayRelMap {
  [key: string]: IDisplayRelMapItem[]
}

export interface INeighboursPickerPopoverProps {
  node: {
    id: string
    propertyMap: any
    labels: string[]
  }
  nodes: INeighbourNode[]
  relationships: INeighbourRel[]
  count: number
  callback: Function
  selection: string[]
  onClose: () => void
  onUpdate: () => void
  grass: any // {[key: string]: {caption: string}}
}

const ScrollDiv = styled.div`
  max-height: 400px;
  overflow-y: auto;
`
const MarginContainer = styled.div`
  margin: 10px 0;
`

export type IDisplayNodeNameFunc = (node?: INeighbourNode) => string
const NeighboursPickerModal: React.FC<INeighboursPickerPopoverProps> = ({
  nodes,
  relationships,
  node,
  selection,
  onClose,
  callback,
  onUpdate,
  grass
}: INeighboursPickerPopoverProps) => {
  const displayNodeName: IDisplayNodeNameFunc = React.useCallback(
    node => {
      if (node) {
        const input = grass[`node.${node.labels[0]}`]?.caption
        if (input) {
          const value = input.substring(1, input.length - 1)
          return (
            node.properties[value] ??
            node.properties.name ??
            node.properties.title ??
            node.properties.id ??
            JSON.stringify(node.properties)
          )
        } else {
          return (
            node.properties.name ??
            node.properties.title ??
            node.properties.id ??
            JSON.stringify(node.properties)
          )
        }
      } else {
        return ''
      }
    },
    [grass]
  )
  const options: INeighboursPickerItem[] = React.useMemo(() => {
    const relMap: [IDisplayRelMap, IDisplayRelMap] = [{}, {}] // dir in and out
    relationships.map(rel => {
      const direction: 'IN' | 'OUT' = rel.startNodeId === node.id ? 'OUT' : 'IN'
      const targetNodeId = direction === 'OUT' ? rel.endNodeId : rel.startNodeId
      const result = {
        id: rel.id,
        type: rel.type,
        direction,
        node: nodes.find(t => t.id === targetNodeId)
      }
      const currentMap = result.direction === 'IN' ? relMap[0] : relMap[1]
      if (currentMap[result.type]) {
        currentMap[result.type].push(result)
      } else {
        currentMap[result.type] = [result]
      }
      return result
    })

    return flatten(
      relMap.map(currentMap =>
        Object.keys(currentMap).map(type => {
          const labelsSet = new Set<string>()
          const items = currentMap[type].sort((a, b) =>
            displayNodeName(a.node) > displayNodeName(b.node) ? 1 : -1
          )
          items.forEach(item => {
            item.node?.labels.forEach(label => labelsSet.add(label))
          })
          return {
            id: currentMap[type][0].id,
            amount: currentMap[type].length,
            type,
            labelsSet,
            direction: currentMap[type][0].direction,
            items
          }
        })
      )
    ).sort((a, b) => (a.type > b.type ? 1 : -1))
  }, [nodes, relationships, node])

  const handleApply = React.useCallback(() => {
    const filteredRelationships = relationships.filter(t =>
      selection.includes(t.id)
    )
    const nodesIds = new Set<string>(
      flatten(filteredRelationships.map(t => [t.startNodeId, t.endNodeId]))
    )
    callback(null, {
      nodes: nodes.filter(t => t.id !== node.id && nodesIds.has(t.id)),
      relationships: filteredRelationships
    })
    onClose()
  }, [selection, node, nodes, relationships, callback, onClose])

  const [
    activeItem,
    setActiveItem
  ] = React.useState<INeighboursPickerItem | null>(null)
  const displayNode: INeighbourNode = React.useMemo(
    () => ({
      id: node.id,
      labels: node.labels,
      properties: node.propertyMap
    }),
    [node]
  )
  // console.log(options, relationships, nodes, node)
  return (
    <GenericModal
      isOpen={true}
      onRequestClose={onClose}
      contentLabel="Node Neighbours"
    >
      <h5>{displayNodeName(displayNode)}</h5>
      <ScrollDiv>
        <table>
          <tbody>
            {options.map(t => {
              if (activeItem === null || activeItem === t) {
                return (
                  <NeighboursPickerItem
                    key={t.id}
                    item={t}
                    selection={selection}
                    onUpdate={onUpdate}
                    setActiveItem={setActiveItem}
                    displayNodeName={displayNodeName}
                  />
                )
              } else {
                return null
              }
            })}
          </tbody>
        </table>
      </ScrollDiv>
      <MarginContainer>
        <ApplyButton onClick={handleApply}>Apply</ApplyButton>
        <SimpleButton onClick={onClose}>Cancel</SimpleButton>
      </MarginContainer>
    </GenericModal>
  )
}

// export default NeighboursPickerModal
const mapStateToProps = (state: GlobalState) => ({ grass: state.grass })
const NeighboursPickerPopoverWrapped = connect(mapStateToProps)(
  NeighboursPickerModal
)
export default NeighboursPickerPopoverWrapped
