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

/* global test, expect, jest */
import { Directives as DirectivesComponent } from './Directives'
import React from 'react'
import { mount } from 'services/testUtils'

describe('Directives', () => {
  test('should attach play topic directive when contents has a play-topic attribute', () => {
    const clickEvent = jest.fn()
    const html = <a play-topic='hello'>foobar</a>
    const result = mount(DirectivesComponent)
      .withProps({ content: html, onItemClick: clickEvent })
      .then(wrapper => {
        const actual = wrapper.find('a').get(0)
        actual.click()
        expect(clickEvent).toHaveBeenCalled()
        expect(clickEvent).toHaveBeenCalledWith(':play hello', true)
      })
    return result
  })
  test('should attach help topic directive when contents has a help-topic attribute', () => {
    const clickEvent = jest.fn()
    const html = <a help-topic='hello'>foobar</a>
    const result = mount(DirectivesComponent)
      .withProps({ content: html, onItemClick: clickEvent })
      .then(wrapper => {
        const actual = wrapper.find('a').get(0)
        actual.click()
        expect(clickEvent).toHaveBeenCalled()
        expect(clickEvent).toHaveBeenCalledWith(':help hello', true)
      })
    return result
  })
  test('should attach runnable directive when element has a tag of `pre.runnable`', () => {
    const clickEvent = jest.fn()
    const html = <pre className='runnable'>foobar</pre>
    const result = mount(DirectivesComponent)
      .withProps({ content: html, onItemClick: clickEvent })
      .then(wrapper => {
        const actual = wrapper.find('pre.runnable').get(0)
        actual.click()
        expect(clickEvent).toHaveBeenCalled()
        expect(clickEvent).toHaveBeenCalledWith('foobar', false)
      })
    return result
  })
  test('should attach runnable directive when element has a class name of `.runnable pre`', () => {
    const clickEvent = jest.fn()
    const html = (
      <span className='runnable'>
        <pre>foobar</pre>
      </span>
    )
    const result = mount(DirectivesComponent)
      .withProps({ content: html, onItemClick: clickEvent })
      .then(wrapper => {
        const actual = wrapper.find('.runnable pre').get(0)
        actual.click()
        expect(clickEvent).toHaveBeenCalled()
        expect(clickEvent).toHaveBeenCalledWith('foobar', false)
      })
    return result
  })

  test('should not attach any directives when contents does not have any directive attributes', () => {
    const clickEvent = jest.fn()
    const html = <a>foobar</a>
    const result = mount(DirectivesComponent)
      .withProps({ content: html, onItemClick: clickEvent })
      .then(wrapper => {
        const actual = wrapper.find('a').get(0)
        actual.click()
        expect(clickEvent).not.toHaveBeenCalled()
      })
    return result
  })

  test('should attach all directives when contents has both attributes in different elements', () => {
    const clickEvent = jest.fn()
    const html = (
      <div>
        <a class='help' is help-topic='help'>
          foobar
        </a>
        <a class='play' is play-topic='play'>
          foobar
        </a>
      </div>
    )
    const result = mount(DirectivesComponent)
      .withProps({ content: html, onItemClick: clickEvent })
      .then(wrapper => {
        const actualHelp = wrapper.find('a.help').get(0)
        const actualPlay = wrapper.find('a.play').get(0)
        actualPlay.click()
        expect(clickEvent).toHaveBeenCalledWith(':play play', true)
        actualHelp.click()
        expect(clickEvent).toHaveBeenCalledWith(':help help', true)
      })
    return result
  })
})
