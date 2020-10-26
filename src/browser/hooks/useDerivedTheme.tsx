/*
 * Copyright (c) 2002-2020 "Neo4j,"
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
import { useState, useEffect } from 'react'
import useAutoTheme from './useAutoTheme'
import { AUTO_THEME, LIGHT_THEME } from 'shared/modules/settings/settingsDuck'

export default function useDerivedTheme(
  selectedTheme,
  defaultTheme = LIGHT_THEME
) {
  const [derivedTheme, overrideAutoTheme] = useAutoTheme(defaultTheme)
  const [environmentTheme, setEnvironmentTheme] = useState(null)

  useEffect(() => {
    if (environmentTheme && selectedTheme === AUTO_THEME) {
      overrideAutoTheme(environmentTheme)
      return
    }
    if (selectedTheme !== AUTO_THEME) {
      overrideAutoTheme(selectedTheme)
    } else {
      overrideAutoTheme(null)
    }
  }, [selectedTheme, environmentTheme])
  return [derivedTheme, setEnvironmentTheme]
}
