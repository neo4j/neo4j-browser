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

import { parseGrass } from './grass'

describe('Grass parser', () => {
  test('Can parse simple grass data', (done) => {
    var data = 'node {color: red;} relationship {shaft-width: 10px;}'
    var parsed = parseGrass(data)
    expect(parsed.node.color).toEqual('red')
    expect(parsed.relationship['shaft-width']).toEqual('10px')
    done()
  })

  test('Returns empty object on strange data', (done) => {
    var data = 'this is not grass data! : { . / , > <'
    var parsed = parseGrass(data)
    expect(parsed).toEqual({})
    done()
  })

  test('Handles id and type captions correctly', (done) => {
    var data = `node {caption: {title};}
                node.PERSON {caption: <id>;}
                relationship {caption: <type>;}
                relationship.KNOWS {caption: {how};}`
    var parsed = parseGrass(data)
    expect(parsed.node.caption).toEqual('title')
    expect(parsed['node.PERSON'].caption).toEqual('<id>')
    expect(parsed.relationship.caption).toEqual('<type>')
    expect(parsed['relationship.KNOWS'].caption).toEqual('how')
    done()
  })

  test('Parsing does not generate any junk', (done) => {
    var data = `node {caption: {title};}
                relationship {caption: <type>;}`
    var parsed = parseGrass(data)
    expect(Object.keys(parsed).length).toEqual(2)
    expect(Object.keys(parsed.node).length).toEqual(1)
    expect(Object.keys(parsed.relationship).length).toEqual(1)
    done()
  })

  test('Parsing grass with odd whitespace', (done) => {
    var data = 'node {border-color : #9AA1AC ; \n\r\t  diameter:50px;color:#A5ABB6; border-width : 2px ; } relationship{ color : #A5ABB6 ; shaft-width : 1px ; font-size : 8px ; padding : 3px ; text-color-external : #000000 ; text-color-internal : #FFFFFF ; caption : <type>; }'
    var parsed = parseGrass(data)
    expect(parsed.node.diameter).toEqual('50px')
    expect(parsed.relationship.color).toEqual('#A5ABB6')
    done()
  })

  test('Handles JSON data', (done) => {
    var data = '{"node": {"diameter":"50px", "color":"#A5ABB6"}, "relationship":{"color":"#A5ABB6","shaft-width":"1px"}}'
    var parsed = parseGrass(data)
    expect(parsed.node.diameter).toEqual('50px')
    expect(parsed.relationship.color).toEqual('#A5ABB6')
    done()
  })
})

