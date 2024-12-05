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
import { useState } from 'react'

interface AccordionProps {
  children: React.ReactNode
  defaultActive?: boolean
  forceOpen?: boolean
}

export function Accordion({ children, defaultActive = false, forceOpen = false }: AccordionProps) {
  const [isActive, setIsActive] = useState(defaultActive)

  return (
    <div className="border border-border-neutral dark:border-border-neutral-dark rounded-md">
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return null
        return React.cloneElement(child, {
          active: forceOpen || isActive,
          onClick: () => !forceOpen && setIsActive(!isActive)
        })
      })}
    </div>
  )
}

interface TitleProps {
  children: React.ReactNode
  onClick?: () => void
}

function Title({ children, onClick }: TitleProps) {
  return (
    <div 
      onClick={onClick}
      className="px-4 py-2 border-t border-border-neutral dark:border-border-neutral-dark cursor-pointer hover:bg-surface-neutral-hover dark:hover:bg-surface-neutral-hover-dark"
    >
      {children}
    </div>
  )
}
Accordion.Title = Title

interface ContentProps {
  children: React.ReactNode
  active?: boolean
}

function Content({ children, active }: ContentProps) {
  if (!active) return null
  return (
    <div className="px-4 py-3 bg-surface-neutral dark:bg-surface-neutral-dark">
      {children}
    </div>
  )
}
Accordion.Content = Content

export default Accordion
