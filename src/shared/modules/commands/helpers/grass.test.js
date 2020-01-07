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

import { fetchRemoteGrass } from './grass'
import { parseGrass } from 'shared/services/grassUtils'

jest.mock('services/remote', () => {
  return {
    get: url => {
      return new Promise((resolve, reject) => {
        resolve(url)
      })
    }
  }
})

describe('Grass remote fetch', () => {
  test('should not fetch from url not in the whitelist', () => {
    const whitelist = 'http://foo'
    const urlNotInWhitelist = 'http://bar'
    return expect(
      fetchRemoteGrass(urlNotInWhitelist, whitelist)
    ).rejects.toMatchObject(
      new Error('Hostname is not allowed according to server whitelist')
    )
  })
  test('should fetch from url in the whitelist', () => {
    const whitelist = 'http://foo'
    const urlInWhitelist = 'http://foo'
    return expect(fetchRemoteGrass(urlInWhitelist, whitelist)).resolves.toBe(
      urlInWhitelist
    )
  })
})

describe('Grass parser', () => {
  test('Can parse simple grass data', () => {
    const data = 'node {color: red;} relationship {shaft-width: 10px;}'
    const parsed = parseGrass(data)
    expect(parsed.node.color).toEqual('red')
    expect(parsed.relationship['shaft-width']).toEqual('10px')
  })

  test('Returns empty object on strange data', () => {
    const data = 'this is not grass data! : { . / , > <'
    const parsed = parseGrass(data)
    expect(parsed).toEqual({})
  })

  test('Handles id and type captions correctly', () => {
    const data = `node {caption: {title};}
                node.PERSON {caption: <id>;}
                relationship {caption: <type>;}
                relationship.KNOWS {caption: {how};}`
    const parsed = parseGrass(data)
    expect(parsed.node.caption).toEqual('title')
    expect(parsed['node.PERSON'].caption).toEqual('<id>')
    expect(parsed.relationship.caption).toEqual('<type>')
    expect(parsed['relationship.KNOWS'].caption).toEqual('how')
  })

  test('Parsing does not generate any junk', () => {
    const data = `node {caption: {title};}
                relationship {caption: <type>;}`
    const parsed = parseGrass(data)
    expect(Object.keys(parsed).length).toEqual(2)
    expect(Object.keys(parsed.node).length).toEqual(1)
    expect(Object.keys(parsed.relationship).length).toEqual(1)
  })

  test('Parsing grass with odd whitespace', () => {
    const data =
      'node {border-color : #9AA1AC ; \n\r\t  diameter:50px;color:#A5ABB6; border-width : 2px ; } relationship{ color : #A5ABB6 ; shaft-width : 1px ; font-size : 8px ; padding : 3px ; text-color-external : #000000 ; text-color-internal : #FFFFFF ; caption : <type>; }'
    const parsed = parseGrass(data)
    expect(parsed.node.diameter).toEqual('50px')
    expect(parsed.relationship.color).toEqual('#A5ABB6')
  })

  test('Handles JSON data', () => {
    const data =
      '{"node": {"diameter":"50px", "color":"#A5ABB6"}, "relationship":{"color":"#A5ABB6","shaft-width":"1px"}}'
    const parsed = parseGrass(data)
    expect(parsed.node.diameter).toEqual('50px')
    expect(parsed.relationship.color).toEqual('#A5ABB6')
  })
})
