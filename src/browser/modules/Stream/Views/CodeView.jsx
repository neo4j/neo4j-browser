/*
 * Copyright (c) 2002-2017 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

import style from './code_style.css'
import { PaddedDiv } from '../styled'

const CodeView = ({request, query, style: displayStyle}) => {
  if (request.status !== 'success') return null
  return (
    <PaddedDiv style={displayStyle}>
      <table>
        <tbody className={style.altRows}>
          <tr>
            <td className={style.bold}>Server version</td>
            <td>{request.result.summary.server.version}</td>
          </tr>
          <tr>
            <td className={style.bold}>Server address</td>
            <td>{request.result.summary.server.address}</td>
          </tr>
          <tr>
            <td className={style.bold}>Query</td>
            <td>{query}</td>
          </tr>
          <tr>
            <td className={style.bold}>Response</td>
            <td>
              <pre>{JSON.stringify(request.result.records, null, 2)}</pre>
            </td>
          </tr>
        </tbody>
      </table>
    </PaddedDiv>
  )
}

export default CodeView
