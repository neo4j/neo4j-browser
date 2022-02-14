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
import React from 'react'

import { IconContainer } from './IconContainer'
import fitToScreenIcon from 'icons/iconsToBeFetchedFromNDL/fit-to-screen.svg'
import infoCircle from 'icons/iconsToBeFetchedFromNDL/information-circle.svg'
import zoomInIcon from 'icons/iconsToBeFetchedFromNDL/zoom-in.svg'
import zoomOutIcon from 'icons/iconsToBeFetchedFromNDL/zoom-out.svg'

const ZOOM_ICONS_DEFAULT_SIZE_IN_PX = 20
const ZOOM_ICONS_LARGE_SCALE_FACTOR = 1.2
export const ZoomInIcon = ({ large }: { large: boolean }): JSX.Element => {
  const scale = large ? ZOOM_ICONS_LARGE_SCALE_FACTOR : 1
  return (
    <IconContainer
      icon={zoomInIcon}
      width={scale * ZOOM_ICONS_DEFAULT_SIZE_IN_PX}
    />
  )
}
export const ZoomOutIcon = ({
  large = false
}: {
  large?: boolean
}): JSX.Element => {
  const scale = large ? ZOOM_ICONS_LARGE_SCALE_FACTOR : 1
  return (
    <IconContainer
      icon={zoomOutIcon}
      width={scale * ZOOM_ICONS_DEFAULT_SIZE_IN_PX}
    />
  )
}

export const ZoomToFitIcon = ({ large }: { large: boolean }): JSX.Element => {
  const scale = large ? ZOOM_ICONS_LARGE_SCALE_FACTOR : 1
  return (
    <IconContainer
      icon={fitToScreenIcon}
      width={scale * ZOOM_ICONS_DEFAULT_SIZE_IN_PX}
    />
  )
}

export const InfoIcon = (): JSX.Element => <IconContainer icon={infoCircle} />
