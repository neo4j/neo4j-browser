import { connect } from 'preact-redux'
import { withBus } from 'preact-suber'
import { SET_CONTENT, setContent } from 'shared/modules/editor/editorDuck'
import {DrawerSubHeader, DrawerSection, DrawerSectionBody} from 'browser-components/drawer'
import { StyledHelpLink, StyledHelpItem, StyledDocumentActionLink } from './styled'

export const DocumentItems = ({header, items, onItemClick = null}) => {
  const listOfItems = items.map((item) => {
    switch (item.type) {
      case 'link':
        return (
          <StyledHelpItem>
            <StyledHelpLink href={item.command} target='_blank'>{item.name}</StyledHelpLink>
          </StyledHelpItem>
        )
      default:
        return (
          <StyledHelpItem>
            <StyledDocumentActionLink onClick={() => onItemClick(item.command)} name={item.name} type={item.type} />
          </StyledHelpItem>
        )
    }
  })
  return (
    <DrawerSection>
      <DrawerSubHeader>{header}</DrawerSubHeader>
      <DrawerSectionBody>
        <ul className='document'>
          {listOfItems}
        </ul>
      </DrawerSectionBody>
    </DrawerSection>
  )
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onItemClick: (cmd) => {
      ownProps.bus.send(SET_CONTENT, setContent(cmd))
    }
  }
}

export default withBus(connect(null, mapDispatchToProps)(DocumentItems))
