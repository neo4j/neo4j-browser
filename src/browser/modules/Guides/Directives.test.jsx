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
