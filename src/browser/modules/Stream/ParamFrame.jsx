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

import Render from 'browser-components/Render'
import FrameTemplate from './FrameTemplate'

const ParamFrame = ({frame, params}) => {
  return (
    <FrameTemplate
      header={frame}
      contents={<Render if={frame.success}><pre>{JSON.stringify(frame.params, null, 2)}</pre></Render>}
    >
      <Render if={frame.success}><span>Successfully set your parameter</span></Render>
      <Render if={!frame.success}><span>Something went wrong. Read help pages.</span></Render>
    </FrameTemplate>
  )
}
export default ParamFrame
