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
import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'

import { Lead } from 'browser-components/Text'
import { H3 } from 'browser-components/headers'
import { DARK_THEME } from 'shared/modules/settings/settingsDuck'

function FrameAside(props: any) {
  const theme = useContext(ThemeContext)
  const { subtitle } = props
  let { title } = props

  // Use logo as title if title is only Neo4j
  if (title === 'Neo4j') {
    const isDarkTheme = theme.name === DARK_THEME
    title = (
      <img
        src={`./assets/images/neo4j-logo${isDarkTheme ? '-inverted' : ''}.svg`}
        alt="Neo4j"
        className="frame-title-logo"
      />
    )
  }

  return title ? (
    <>
      {title && <H3>{title}</H3>}
      {subtitle && <Lead>{subtitle}</Lead>}
    </>
  ) : null
}

export default FrameAside
