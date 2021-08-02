import * as React from 'react'
import { IDisplayRelMapItem } from './NeighboursPickerPopover'
import { AddIcon, ArrowLeft, ArrowRight, RemoveIcon } from './icons'
import styled from 'styled-components'
import { motion } from 'framer-motion'

export interface INeighboursPickerItem {
  id: string
  amount: number
  type: string
  direction: 'IN' | 'OUT'
  items: IDisplayRelMapItem[]
}

interface IProps {
  item: INeighboursPickerItem
  selection: string[]
  onUpdate: () => void
  setActiveItem: (item: INeighboursPickerItem | null) => void
}

const TD = styled.td`
  padding: 5px;
`
const TR = styled.tr`
  border-top: 1px solid #5c5c5c;
`
const MotionTR: React.FC = ({ children }) => (
  <motion.tr
    variants={{
      initial: {
        opacity: 0
      },
      animate: {
        opacity: 1
      },
      exit: {
        opacity: 0
      }
    }}
    initial={'initial'}
    animate={'animate'}
    exit={'exit'}
    // transition={{
    //   type: 'spring',
    //   mass: 0.35,
    //   stiffness: 45
    // }}
    // layout={'position'}
  >
    {children}
  </motion.tr>
)
const NeighboursPickerItem: React.FC<IProps> = ({
  item,
  selection,
  onUpdate,
  setActiveItem
}: IProps) => {
  const [open, setOpen] = React.useState(false)
  const toggleOpen = React.useCallback(() => setOpen(t => !t), [setOpen])
  const checkboxRef = React.useRef<HTMLInputElement>(null)
  const isChecked = item.items.every(t => selection.includes(t.id))

  React.useEffect(() => {
    setActiveItem(open ? item : null)
  }, [setActiveItem, open, item])

  const handleChange = React.useCallback(() => {
    if (isChecked) {
      item.items.forEach(nested => {
        const index = selection.indexOf(nested.id)
        if (index !== -1) {
          selection.splice(index, 1)
        }
      })
    } else {
      item.items.forEach(nested => {
        selection.push(nested.id)
      })
    }
    onUpdate()
  }, [item, selection, isChecked, onUpdate])

  const handleNestedChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
    e => {
      const id = e.target.dataset.id ?? ''
      console.log(id, e.target.checked, selection)
      if (e.target.checked) {
        selection.push(id)
      } else {
        const index = selection.indexOf(id)
        if (index !== -1) {
          selection.splice(index, 1)
        }
      }
      onUpdate()
    },
    [item, selection, onUpdate]
  )

  React.useEffect(() => {
    if (checkboxRef.current) {
      if (isChecked || selection.length === 0) {
        checkboxRef.current.indeterminate = false
      } else {
        checkboxRef.current.indeterminate = item.items.some(t =>
          selection.includes(t.id)
        )
      }
    }
  }, [isChecked, selection, item, checkboxRef])

  return (
    <>
      <MotionTR>
        <TD>
          <input
            ref={checkboxRef}
            type={'checkbox'}
            data-id={item.id}
            checked={isChecked}
            onChange={handleChange}
          />
        </TD>
        <TD>{item.direction === 'OUT' ? <ArrowRight /> : <ArrowLeft />}</TD>
        <TD>{item.type}</TD>
        <TD>{item.items[0].node?.labels.join(' ')}</TD>
        <TD>
          {item.items.length === 1 ? (
            item.items[0].node?.properties.name ??
            item.items[0].node?.properties.title ??
            ''
          ) : (
            <OpenIconDisplay open={open} onClick={toggleOpen}>
              {item.items.length}
            </OpenIconDisplay>
          )}
        </TD>
      </MotionTR>
      {open && (
        <>
          {item.items.map(t => (
            <MotionTR key={t.id}>
              <TD></TD>
              <TD>
                <input
                  type={'checkbox'}
                  data-id={t.id}
                  checked={selection.includes(t.id)}
                  onChange={handleNestedChange}
                />
              </TD>
              <TD>{t.node?.properties.name ?? t.node?.properties.title}</TD>
            </MotionTR>
          ))}
        </>
      )}
    </>
  )
}

const IconContainer = styled.div`
  display: inline-block;
  vertical-align: middle;
  cursor: pointer;
`
const IconText = styled.span`
  vertical-align: middle;
  margin-left: 3px;
`
const OpenIconDisplay: React.FC<{ open: boolean; onClick: () => void }> = ({
  open,
  onClick,
  children
}) => {
  return (
    <IconContainer onClick={onClick}>
      {open ? <RemoveIcon /> : <AddIcon />}
      <IconText>{children}</IconText>
    </IconContainer>
  )
}
export default NeighboursPickerItem
