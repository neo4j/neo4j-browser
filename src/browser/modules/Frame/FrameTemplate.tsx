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

import React, { useEffect, useRef, useState } from 'react'

import {
  StyledFrameBody,
  StyledFrameContents,
  StyledFrameStatusbar,
  StyledFrameMainSection,
  StyledFrameAside
} from './styled'

type FrameTemplateProps = {
  contents: JSX.Element | null | string
  sidebar?: () => JSX.Element | null
  aside?: JSX.Element | null
  statusbar?: JSX.Element | null
  removePadding?: boolean
  hasSlides?: boolean
  onResize?: (fullscreen: boolean, collapsed: boolean, height: number) => void
}

function FrameTemplate({
  contents,
  sidebar,
  aside,
  statusbar,
  onResize = () => {
    /*no op*/
  },
  removePadding = false,
  hasSlides = false
}: FrameTemplateProps): JSX.Element {
  const frameContentElementRef = useRef<HTMLDivElement>(null)
  const [lastHeight, setLastHeight] = useState(10)

  useEffect(() => {
    if (!frameContentElementRef.current?.clientHeight) return
    const currHeight = frameContentElementRef.current.clientHeight
    if (currHeight < 300) return // No need to report a transition

    if (lastHeight !== currHeight) {
      onResize(false, false, currHeight)
      setLastHeight(currHeight)
    }
  }, [lastHeight, onResize])

  return (
    <>
      <StyledFrameBody removePadding={removePadding} hasSlides={hasSlides}>
        {sidebar && sidebar()}
        {aside && <StyledFrameAside>{aside}</StyledFrameAside>}
        <StyledFrameMainSection>
          <StyledFrameContents
            ref={frameContentElementRef}
            data-testid="frameContents"
          >
            {contents}
          </StyledFrameContents>
        </StyledFrameMainSection>
      </StyledFrameBody>

      {statusbar && (
        <StyledFrameStatusbar data-testid="frameStatusbar">
          {statusbar}
        </StyledFrameStatusbar>
      )}
    </>
  )
}

export default FrameTemplate
