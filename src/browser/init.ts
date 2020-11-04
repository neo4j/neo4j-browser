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
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import './styles/bootstrap.grid-only.min.css'
import './styles/streamline.css'
import './styles/editor.css'
import './styles/neo4j-world.css'
import './styles/font-awesome.min.css'
import './styles/fira-code.css'
import './styles/open-sans.css'
import '@relate-by-ui/css/semantic/dist/relate-by.min.css'

// non web env (just for tests)
if (typeof btoa === 'undefined') {
  global.btoa = function(str) {
    return Buffer.from(str, 'binary').toString('base64')
  }
}
