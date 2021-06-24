import styled from 'styled-components'
import React, { useState } from 'react'
import { CopyIcon } from './icons/Icons'

type ClipboardCopierProps = {
  textToCopy: string
  positionAbsolute?: boolean
  iconSize?: number
}
function ClipboardCopier({
  textToCopy: text,
  positionAbsolute = false,
  iconSize = 20
}: ClipboardCopierProps): JSX.Element {
  const [messageToShow, setMessageToShow] = useState<string | null>(null)
  function showPopup(text: string) {
    setMessageToShow(text)
    setTimeout(() => setMessageToShow(null), 1000)
  }
  const Wrapper = positionAbsolute ? CopyIconAbsolutePositioner : React.Fragment

  return (
    <Wrapper>
      <CopyIconContainer
        onClick={() =>
          copyToClipboard(text)
            .then(() => showPopup('Copied.'))
            .catch(() => showPopup('Copying text failed.'))
        }
      >
        <CopyIcon title="Copy to clipboard" width={iconSize} />
        {messageToShow && <InfoPopup text={messageToShow} />}
      </CopyIconContainer>
    </Wrapper>
  )
}
const CopyIconAbsolutePositioner = styled.span`
  position: absolute;
  right: 15px;
  top: 15px;
`
const CopyIconContainer = styled.span`
  cursor: pointer;
  position: relative;
`

type InfoPopupProps = { text: string }
function InfoPopup({ text }: InfoPopupProps) {
  return <PopupTextContainer> {text} </PopupTextContainer>
}
const PopupTextContainer = styled.span`
  position: absolute;
  z-index: 1;
  white-space: normal;
  right: 30px;
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
