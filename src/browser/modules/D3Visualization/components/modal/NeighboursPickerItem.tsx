import * as React from 'react'
import {
  IDisplayRelMapItem,
  IDisplayNodeNameFunc
} from './NeighboursPickerModal'
import { AddIcon, ArrowLeft, ArrowRight, RemoveIcon } from './icons'
import styled from 'styled-components'
import { motion } from 'framer-motion'

export interface INeighboursPickerItem {
  id: string
  amount: number
  type: string
  direction: 'IN' | 'OUT'
  labelsSet: Set<string>
  items: IDisplayRelMapItem[]
}

interface IProps {
  item: INeighboursPickerItem
  selection: string[]
  onUpdate: () => void
  setActiveItem: (item: INeighboursPickerItem | null) => void
  displayNodeName: IDisplayNodeNameFunc
}

const Label = styled.label`
  cursor: pointer;
`
const Input = styled.input`
  margin-right: 5px;
  vertical-align: middle;
`
const TD = styled.td<{ textAlign?: 'center' }>`
  padding: 5px 10px;
  white-space: nowrap;
  text-align: ${({ textAlign }) => (textAlign ? textAlign : 'inherit')};
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
  setActiveItem,
  displayNodeName
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
        if (!selection.includes(nested.id)) {
          selection.push(nested.id)
        }
      })
    }
    onUpdate()
  }, [item, selection, isChecked, onUpdate])

  const handleNestedChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
    e => {
      const id = e.target.dataset.id ?? ''
      if (e.target.checked) {
        if (!selection.includes(id)) {
          selection.push(id)
        }
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
        <TD textAlign={'center'}>
          {Array.from(item.labelsSet).map(t => (
            <div key={t}>{t}</div>
          ))}
        </TD>
        <TD>
          {item.items.length === 1 ? (
            displayNodeName(item.items[0].node)
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
              <TD />
              <TD colSpan={2}>
                <Label>
                  <Input
                    type={'checkbox'}
                    data-id={t.id}
                    checked={selection.includes(t.id)}
                    onChange={handleNestedChange}
                  />
                  {displayNodeName(t.node)}
                </Label>
              </TD>
              <TD textAlign={'center'}>
                {t.node?.labels.map(t => (
                  <div key={t}>{t}</div>
                ))}
              </TD>
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
