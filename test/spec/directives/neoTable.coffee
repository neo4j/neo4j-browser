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

describe 'Directive: neoTable', () ->
  beforeEach module 'neo4jApp.directives'

  it 'should escape HTML characters', inject ($rootScope, $compile) ->
    scope = $rootScope.$new()
    element = angular.element '<neo-table table-data="val"></neo-table>'
    element = $compile(element)(scope)
    scope.val =
      rows: -> [['<script>']]
      displayedSize: 1
      columns: -> ['col']
    scope.$apply()
    expect(element.html()).toContain('&lt;script&gt;')

  it 'should build hrefs for hyperlinks in values', inject ($rootScope, $compile) ->
    scope = $rootScope.$new()
    element = angular.element '<neo-table table-data="val"></neo-table>'
    element = $compile(element)(scope)
    scope.val =
      rows: -> [['http://test.com']]
      displayedSize: 1
      columns: -> ['col']
    scope.$apply()
    expect(element.html()).toContain('href')
