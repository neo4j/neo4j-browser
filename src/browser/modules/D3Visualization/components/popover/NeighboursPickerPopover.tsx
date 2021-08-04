import * as React from 'react'
import styled from 'styled-components'
import Modal from 'react-modal'
import { flatten } from 'lodash-es'
import NeighboursPickerItem, {
  INeighboursPickerItem
} from './NeighboursPickerItem'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
}

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
  }
  nodes: INeighbourNode[]
  relationships: INeighbourRel[]
  count: number
  callback: Function
  selection: string[]
  onClose: () => void
  onUpdate: () => void
}

const ScrollDiv = styled.div`
  max-height: 400px;
  overflow-y: auto;
`
const MarginContainer = styled.div`
  margin: 10px 0;
`
const ApplyButton = styled.button`
  padding: 3px 15px;
  margin-right: 20px;
  background-color: #008cc1;
  color: white;
  border: 1px solid #6f6f6f;
  border-radius: 1px;
`
const Button = styled.button`
  padding: 3px 15px;
  border-radius: 1px;
  border: 1px solid #6f6f6f;
`
function displayNodeName(node: any): string {
  if (node) {
    return (
      node.title ??
      node.name ??
      node.number ??
      node.inspection_lot_id ??
      node.batch_number ??
      node.id
    )
  } else {
    return ''
  }
}
const NeighboursPickerPopover: React.FC<INeighboursPickerPopoverProps> = ({
  nodes,
  relationships,
  node,
  selection,
  onClose,
  callback,
  onUpdate
}: INeighboursPickerPopoverProps) => {
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
        Object.keys(currentMap).map(type => ({
          id: currentMap[type][0].id,
          amount: currentMap[type].length,
          type,
          direction: currentMap[type][0].direction,
          items: currentMap[type]
        }))
      )
    )
  }, [nodes, relationships, node])

  // const handleChange = React.useCallback(
  //   (e: React.ChangeEvent<HTMLInputElement>) => {
  //     const id: string = e.target.dataset.id + ''
  //     const index = selection.indexOf(id)
  //     if (index === -1) {
  //       selection.push(id)
  //     } else {
  //       selection.splice(index, 1)
  //     }
  //     forceUpdate()
  //   },
  //   []
  // )

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

  console.log(options)
  return (
    <Modal
      isOpen={true}
      onAfterOpen={() => {}}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Node Neighbours"
    >
      <h5>{displayNodeName(node.propertyMap)}</h5>
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
        <Button onClick={onClose}>Cancel</Button>
      </MarginContainer>
    </Modal>
  )
}

export default NeighboursPickerPopover
