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
import React, { TransitionEvent, useEffect, useState } from 'react'

import { StyledNodeInspectorContainer } from './styled'

const Closing = 'CLOSING'
const Closed = 'CLOSED'
const Open = 'OPEN'
const Opening = 'OPENING'
type DrawerTransitionState =
  | typeof Closing
  | typeof Closed
  | typeof Open
  | typeof Opening

type NodeInspectorDrawerProps = {
  isOpen: boolean
  width: number
  children: JSX.Element
}
export function NodeInspectorDrawer({
  width,
  isOpen,
  children
}: NodeInspectorDrawerProps): JSX.Element {
  const [transitionState, setTransitionState] = useState<DrawerTransitionState>(
    isOpen ? Open : Closed
  )

  useEffect(() => {
    if (isOpen) {
      if (transitionState === Closed || transitionState === Closing) {
        setTransitionState(Opening)
      }
    } else {
      if (transitionState === Open || transitionState === Opening) {
        setTransitionState(Closing)
      }
    }
  }, [isOpen, transitionState])

  const onTransitionEnd = (event: TransitionEvent<HTMLDivElement>): void => {
    if (event.propertyName !== 'width') {
      return
    }
    if (transitionState === Closing) {
      setTransitionState(Closed)
    }
    if (transitionState === Opening) {
      setTransitionState(Open)
    }
  }

  const drawerIsVisible =
    transitionState === Opening ||
    transitionState === Open ||
    transitionState === Closing

  return (
    <StyledNodeInspectorContainer
      paneWidth={!isOpen ? 0 : width}
      onTransitionEnd={onTransitionEnd}
      shouldAnimate={transitionState !== Open}
    >
      {drawerIsVisible && children}
    </StyledNodeInspectorContainer>
  )
}
