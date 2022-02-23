import React, { PropsWithChildren } from 'react'
import { Popup } from 'semantic-ui-react'
import styled from 'styled-components'

const StyleWrapper = styled.div`
  .relatable__toolbar-popup {
    min-width: 250px;
  }

  .relatable__toolbar-value {
    margin: 0 5px 5px 0;
  }

  .relatable__toolbar-popup .relatable__toolbar-popup-button.button {
    box-shadow: none;
  }
`

export function ToolbarPopup({
  children = null,
  content,
  name,
  selectedToolbarAction,
  ...rest
}: PropsWithChildren<any>) {
  const isOpen = selectedToolbarAction && selectedToolbarAction.name === name

  return (
    <Popup
      {...rest}
      on="click"
      open={isOpen}
      style={{ maxWidth: 'none' }}
      position="bottom left"
      trigger={children}
    >
      <StyleWrapper>{content}</StyleWrapper>
    </Popup>
  )
}
