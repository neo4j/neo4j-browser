import * as React from 'react'
import FramePopover from 'project-root/src/browser/modules/Frame/FramePopover'
import styled from 'styled-components'

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
}
const TD = styled.td`
  padding: 5px;
`
const TR = styled.tr`
  border-top: 1px solid #5c5c5c;
`
const NeighboursPickerPopover: React.FC<INeighboursPickerPopoverProps> = ({
  nodes,
  relationships,
  node,
  selection
}: INeighboursPickerPopoverProps) => {
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
  console.log(node, options, selection)
  return (
    <FramePopover>
      <h5>{node.propertyMap.name ?? node.propertyMap.title}</h5>
      <table>
        <tbody>
          {options.map(t => (
            <TR key={t.id}>
              <TD>
                <input type={'checkbox'} checked={selection.includes(t.id)} />
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
    </FramePopover>
  )
}

export default NeighboursPickerPopover
