import styled from 'styled-components'
import React, { useState } from 'react'
import { CopyIcon } from './icons/Icons'

type ClipboardCopierProps = {
  textToCopy: string
  iconSize?: number
  titleText?: string
}
function ClipboardCopier({
  textToCopy: text,
  iconSize = 20,
  titleText = 'Copy to clipboard'
}: ClipboardCopierProps): JSX.Element {
  const [messageToShow, setMessageToShow] = useState<string | null>(null)
  function showPopup(text: string) {
    setMessageToShow(text)
    setTimeout(() => setMessageToShow(null), 1500)
  }

  return (
    <CopyIconContainer
      onClick={() =>
        copyToClipboard(text)
          .then(() => showPopup('✔️ Copied to clipboard'))
          .catch(() => showPopup('Copying text failed'))
      }
    >
      <CopyIcon title={titleText} width={iconSize} />
      {messageToShow && <InfoPopup text={messageToShow} />}
    </CopyIconContainer>
  )
}

const CopyIconContainer = styled.span`
  cursor: pointer;
  position: relative;
  color: ${props => props.theme.frameControlButtonTextColor};
`

type InfoPopupProps = { text: string }
function InfoPopup({ text }: InfoPopupProps) {
  return <PopupTextContainer> {text} </PopupTextContainer>
}
const PopupTextContainer = styled.span`
  position: absolute;
  white-space: nowrap;
  right: 30px;
  bottom: 0;
  border-radius: 2px;
  background-color: ${props => props.theme.frameSidebarBackground};
  box-shadow: ${props => props.theme.standardShadow};
  color: ${props => props.theme.primaryText}
  font-family: ${props => props.theme.drawerHeaderFontFamily};
  padding: 0 5px;
`

export function copyToClipboard(text: string): Promise<void> {
  // navigator clipboard requires https
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback deprecated method, which requires a textarea
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    return new Promise<void>((resolve, reject) => {
      document.execCommand('copy') ? resolve() : reject()
      textArea.remove()
    })
  }
}

export default ClipboardCopier
