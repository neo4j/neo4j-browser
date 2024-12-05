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
import { tableStyles } from '../styles/commonStyles'

export function Table({ children, className = '', ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className={tableStyles.container}>
      <table className={`${tableStyles.table} ${className}`} {...props}>
        {children}
      </table>
    </div>
  )
}

export function Th({ children, className = '', ...props }: React.ThHTMLAttributes<HTMLTableHeaderCellElement>) {
  return (
    <th className={`${tableStyles.th} ${className}`} {...props}>
      {children}
    </th>
  )
}

export function Td({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableDataCellElement>) {
  return (
    <td className={`${tableStyles.td} ${className}`} {...props}>
      {children}
    </td>
  )
}
