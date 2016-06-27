import React from 'react'
import { shallow } from 'enzyme'
import chai from 'chai'
import spies from 'chai-spies'
import chaiEnzyme from 'chai-enzyme'
import { HistoryRowComponent } from './HistoryRow'

const expect = chai.expect
chai.use(spies)
chai.use(chaiEnzyme())

describe('HistoryRowComponent', () => {
  it('should render an entry', () => {
    const entry = {id: 1, cmd: ':first', type: 'x'}
    const wrapper = shallow(<HistoryRowComponent entry={entry} handleEntryClick={() => null} />)
    expect(wrapper.find('li')).to.have.length(1)
    expect(wrapper.find('li')).to.include.text(':first')
  })

  it('should handle clicks', () => {
    const handleEntryClick = chai.spy()
    const entry = {id: 1, cmd: ':first', type: 'x'}
    const wrapper = shallow(<HistoryRowComponent entry={entry} handleEntryClick={handleEntryClick} />)
    wrapper.find('li').simulate('click')
    expect(handleEntryClick).to.have.been.called.with(entry.cmd)
  })
})
