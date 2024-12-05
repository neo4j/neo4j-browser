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

export function Code({ children, className = '' }: React.HTMLProps<HTMLElement>) {
  return (
    <code className={`whitespace-nowrap overflow-hidden text-ellipsis text-red-500 bg-secondary rounded px-1 py-0.5 block w-full text-xs ${className}`}>
      {children}
    </code>
  )
}

export function StyledTableWrapper({ children, className = '' }: React.HTMLProps<HTMLDivElement>) {
  return (
    <div className={`my-5 mx-2.5 ${className}`}>
      {children}
    </div>
  )
}

export function StyledTable({ children, className = '' }: React.HTMLProps<HTMLTableElement>) {
  return (
    <table className={`w-full table-fixed ${className}`}>
      {children}
    </table>
  )
}

interface CellProps extends React.HTMLProps<HTMLTableCellElement> {
  width?: string
}

export function StyledTh({ width = 'auto', children, className = '' }: CellProps) {
  return (
    <th className={`text-left h-[30px] align-top p-1.5 ${className}`} style={{ width }}>
      {children}
    </th>
  )
}

export function StyledTd({ width = 'auto', children, className = '' }: CellProps) {
  return (
    <td className={`p-1.5 truncate ${className}`} style={{ width }}>
      {children}
    </td>
  )
}

export function VirtualTableBody({ children, className = '' }: React.HTMLProps<HTMLDivElement>) {
  return (
    <div className={`h-[400px] overflow-auto border border-border border-t-0 bg-background 
      scrollbar-thin scrollbar-track-secondary scrollbar-thumb-primary scrollbar-thumb-rounded-md ${className}`}>
      {children}
    </div>
  )
}

interface VirtualRowProps extends React.HTMLProps<HTMLDivElement> {
  isEven: boolean
}

export function VirtualRow({ isEven, children, className = '' }: VirtualRowProps) {
  return (
    <div className={`flex p-3 border-b border-border transition-colors
      ${isEven ? 'bg-background' : 'bg-secondary'}
      hover:bg-primary/20 ${className}`}>
      {children}
    </div>
  )
}

interface VirtualCellProps extends React.HTMLProps<HTMLDivElement> {
  width: string
}

export function VirtualCell({ width, children, className = '' }: VirtualCellProps) {
  return (
    <div className={`pr-2 overflow-hidden ${className}`} style={{ width }}>
      {children}
    </div>
  )
}

export function MetaInfo({ children, className = '' }: React.HTMLProps<HTMLDivElement>) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {children}
    </div>
  )
}
