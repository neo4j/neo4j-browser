import * as React from 'react'
import styled from 'styled-components'
import Modal from 'react-modal'
import { useForceUpdate } from 'browser-components/SavedScripts/hooks'
import { flatten } from 'lodash-es'
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
export interface INeighboursPickerPopoverProps {
  node: {
    id: string
    propertyMap: any
  }
  nodes: Array<{
    id: string
    labels: string[]
    properties: any
  }>
  relationships: Array<{
    endNodeId: string
    id: string
    properties: any
    startNodeId: string
    type: string
  }>
  count: number
  callback: Function
  selection: string[]
  onClose: () => void
}
const TD = styled.td`
  padding: 5px;
`
const TR = styled.tr`
  border-top: 1px solid #5c5c5c;
`
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
const NeighboursPickerPopover: React.FC<INeighboursPickerPopoverProps> = ({
  nodes,
  relationships,
  node,
  selection,
  onClose,
  callback
}: INeighboursPickerPopoverProps) => {
  const forceUpdate = useForceUpdate()
  const options = React.useMemo(() => {
    return relationships.map(rel => {
      const direction: 'IN' | 'OUT' = rel.startNodeId === node.id ? 'OUT' : 'IN'
      const targetNodeId = direction === 'OUT' ? rel.endNodeId : rel.startNodeId
      return {
        id: rel.id,
        type: rel.type,
        direction,
        node: nodes.find(t => t.id === targetNodeId)
      }
    })
  }, [nodes, relationships, node])

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const id: string = e.target.dataset.id + ''
      const index = selection.indexOf(id)
      if (index === -1) {
        selection.push(id)
      } else {
        selection.splice(index, 1)
      }
      forceUpdate()
    },
    []
  )

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

  return (
    <Modal
      isOpen={true}
      onAfterOpen={() => {}}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Node Neighbours"
    >
      <h5>{node.propertyMap.name ?? node.propertyMap.title}</h5>
      <ScrollDiv>
        <table>
          <tbody>
            {options.map(t => (
              <TR key={t.id}>
                <TD>
                  <input
                    type={'checkbox'}
                    data-id={t.id}
                    checked={selection.includes(t.id)}
                    onChange={handleChange}
                  />
                </TD>
                <TD>{t.direction === 'OUT' ? '>' : '<'}</TD>
                <TD>{t.type}</TD>
                <TD>{t.node?.labels.join(' ')}</TD>
                <TD>
                  {t.node?.properties.name ?? t.node?.properties.title ?? ''}
                </TD>
              </TR>
            ))}
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
