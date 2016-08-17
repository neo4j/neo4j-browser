import {DirectivesComponent} from './Directives'
import React from 'react'
import chai from 'chai'
import {mount} from 'enzyme'
import spies from 'chai-spies'
import chaiEnzyme from 'chai-enzyme'

const expect = chai.expect
chai.use(spies)
chai.use(chaiEnzyme())

describe('Directives', () => {
  it('should attach play topic directive when contents has a play-topic attribute', () => {
    const clickEvent = chai.spy()
    const html = (<a is play-topic='hello'>foobar</a>)
    const wrapper = mount(<DirectivesComponent content={html} onItemClick={clickEvent}/>)
    const actual = wrapper.find('a').get(0)
    actual.click()
    expect(clickEvent).to.have.been.called()
    expect(clickEvent).have.been.called.with(':play hello')
  })
  it('should attach help topic directive when contents has a help-topic attribute', () => {
    const clickEvent = chai.spy()
    const html = (<a is help-topic='hello'>foobar</a>)
    const wrapper = mount(<DirectivesComponent content={html} onItemClick={clickEvent}/>)
    const actual = wrapper.find('a').get(0)
    actual.click()
    expect(clickEvent).to.have.been.called()
    expect(clickEvent).have.been.called.with(':help hello')
  })
  it('should attach runnable directive when element has a class name of `runnable`', () => {
    const clickEvent = chai.spy()
    const html = (<div className='runnable'>foobar</div>)
    const wrapper = mount(<DirectivesComponent content={html} onItemClick={clickEvent}/>)
    const actual = wrapper.find('.runnable').get(0)
    actual.click()
    expect(clickEvent).to.have.been.called()
    expect(clickEvent).have.been.called.with('foobar')
  })
  it('should not attach any directives when contents does not have any directive attributes', () => {
    const clickEvent = chai.spy()
    const html = (<a is>foobar</a>)
    const wrapper = mount(<DirectivesComponent content={html} onItemClick={clickEvent}/>)
    const actual = wrapper.find('a').get(0)
    actual.click()
    expect(clickEvent).not.to.have.been.called()
  })
  it('should attach all directives when contents has both attributes in different elements', () => {
    const clickEvent = chai.spy()
    const html = (
      <div>
        <a class='help' is help-topic='help'>foobar</a>
        <a class='play' is play-topic='play'>foobar</a>
      </div>
    )
    const wrapper = mount(<DirectivesComponent content={html} onItemClick={clickEvent}/>)
    const actualHelp = wrapper.find('a.help').get(0)
    const actualPlay = wrapper.find('a.play').get(0)
    actualPlay.click()
    expect(clickEvent).have.been.called.with(':play play')
    clickEvent.reset()
    actualHelp.click()
    expect(clickEvent).have.been.called.with(':help help')
  })
})
