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

/* global test, expect, jest */
import { Directives as DirectivesComponent } from './Directives'
import React from 'react'
import {mount} from 'enzyme'

describe('Directives', () => {
  test('should attach play topic directive when contents has a play-topic attribute', () => {
    const clickEvent = jest.fn()
    const html = (<a is play-topic='hello'>foobar</a>)
    const wrapper = mount(<DirectivesComponent content={html} onItemClick={clickEvent} />)
    const actual = wrapper.find('a').get(0)
    actual.click()
    expect(clickEvent).toHaveBeenCalled()
    expect(clickEvent).toHaveBeenCalledWith(':play hello')
  })
  test('should attach help topic directive when contents has a help-topic attribute', () => {
    const clickEvent = jest.fn()
    const html = (<a is help-topic='hello'>foobar</a>)
    const wrapper = mount(<DirectivesComponent content={html} onItemClick={clickEvent} />)
    const actual = wrapper.find('a').get(0)
    actual.click()
    expect(clickEvent).toHaveBeenCalled()
    expect(clickEvent).toHaveBeenCalledWith(':help hello')
  })
  test('should attach runnable directive when element has a class name of `runnable`', () => {
    const clickEvent = jest.fn()
    const html = (<div className='runnable'>foobar</div>)
    const wrapper = mount(<DirectivesComponent content={html} onItemClick={clickEvent} />)
    const actual = wrapper.find('.runnable').get(0)
    actual.click()
    expect(clickEvent).toHaveBeenCalled()
    expect(clickEvent).toHaveBeenCalledWith('foobar')
  })
  test('should not attach any directives when contents does not have any directive attributes', () => {
    const clickEvent = jest.fn()
    const html = (<a is>foobar</a>)
    const wrapper = mount(<DirectivesComponent content={html} onItemClick={clickEvent} />)
    const actual = wrapper.find('a').get(0)
    actual.click()
    expect(clickEvent).not.toHaveBeenCalled()
  })
  test('should attach all directives when contents has both attributes in different elements', () => {
    const clickEvent = jest.fn()
    const html = (
      <div>
        <a class='help' is help-topic='help'>foobar</a>
        <a class='play' is play-topic='play'>foobar</a>
      </div>
    )
    const wrapper = mount(<DirectivesComponent content={html} onItemClick={clickEvent} />)
    const actualHelp = wrapper.find('a.help').get(0)
    const actualPlay = wrapper.find('a.play').get(0)
    actualPlay.click()
    expect(clickEvent).toHaveBeenCalledWith(':play play')
    actualHelp.click()
    expect(clickEvent).toHaveBeenCalledWith(':help help')
  })
})
