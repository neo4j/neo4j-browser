/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import React, { useState } from 'react'
import styled from 'styled-components'

import { CopyIcon } from '../icons/Icons'

type ClipboardCopierProps = {
  textToCopy: string
  iconSize?: number
  titleText?: string
  messageOnSuccess?: string
  messageOnFailure?: string
}
export function ClipboardCopier({
  textToCopy: text,
  iconSize = 16,
  titleText = 'Copy to clipboard',
  messageOnSuccess = '✔️ Copied to clipboard',
  messageOnFailure = 'Copying text failed'
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
          .then(() => showPopup(messageOnSuccess))
          .catch(() => showPopup(messageOnFailure))
      }
      title={titleText}
    >
      <CopyIcon width={iconSize} />
      {messageToShow && <InfoPopup text={messageToShow} />}
    </CopyIconContainer>
  )
}

const CopyIconContainer = styled.span`
  cursor: pointer;
  position: relative;
  color: ${props => props.theme.frameControlButtonTextColor};
  font-size: 12px;
`

type InfoPopupProps = { text: string }
function InfoPopup({ text }: InfoPopupProps) {
  return <PopupTextContainer> {text} </PopupTextContainer>
}
const PopupTextContainer = styled.span`
  position: absolute;
  white-space: nowrap;
  right: 20px;
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
