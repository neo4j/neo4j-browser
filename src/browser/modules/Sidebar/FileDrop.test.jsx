/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
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

/* global describe, test, expect, jest */
import React from 'react'
import { FileDrop } from './FileDrop'
import { shallow } from 'enzyme'

describe('FileDrop', () => {
  const expectedFileContent = 'some content'
  const file = new window.File([expectedFileContent], 'valid.cypher')
  const unknownFile = new window.File([expectedFileContent], 'invalid.file')
  const readAsText = jest.fn()
  const stubFileReader = { readAsText, result: expectedFileContent }

  test('should read file', done => {
    const onFileDropped = jest.fn()
    const wrapper = shallow(
      <FileDrop fileReader={stubFileReader} onFileDropped={onFileDropped} />
    )
    wrapper.instance().onDrop([file])

    try {
      expect(readAsText).toBeCalledWith(file)
      done()
    } catch (error) {
      done.fail(error)
    }
  })
  test('should not read file', done => {
    const onFileDropped = jest.fn()
    const wrapper = shallow(
      <FileDrop fileReader={stubFileReader} onFileDropped={onFileDropped} />
    )
    wrapper.instance().onDrop([unknownFile])

    try {
      expect(wrapper.state().error).toContain('.file')
      done()
    } catch (error) {
      done.fail(error)
    }
  })
})
