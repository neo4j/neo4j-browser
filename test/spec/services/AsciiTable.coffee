###!
Copyright (c) 2002-2016 "Neo Technology,"
Network Engine for Objects in Lund AB [http://neotechnology.com]

This file is part of Neo4j.

Neo4j is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
###

'use strict'

describe 'Service: AsciiTable', () ->
  AsciiTable = {}
  beforeEach ->
    module 'neo4jApp.services'
    inject((_AsciiTable_) ->
      AsciiTable = _AsciiTable_
    )

  it ' - instance should not be singleton ', ->
    i1 = AsciiTable.getInstance()
    i2 = AsciiTable.getInstance()
    i1.maxWidth = 100
    expect(i1.maxWidth).toBe(100)
    expect(i2.maxWidth).toBe(0)
