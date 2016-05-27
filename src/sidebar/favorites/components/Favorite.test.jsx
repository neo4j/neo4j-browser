import React from 'react'
import chai from 'chai'
import { shallow } from 'enzyme'
import chaiEnzyme from 'chai-enzyme'
import spies from 'chai-spies'
import { FavoriteComponent } from './Favorite'

describe('FavoriteComponent', () => {
  const expect = chai.expect

  it('should show name of script', () => {
    const wrapper = shallow(<FavoriteComponent name={'Test script'} content={''}/>)
    expect(wrapper.find('.favorite')).to.have.length(1)
    expect(wrapper.find('.favorite').text()).to.equal('Test script')
  })

  it('should show tigger event with content of script', () => {
    const expect = chai.expect
    chai.use(spies)
    chai.use(chaiEnzyme())
    const onItemClick = chai.spy()
    const wrapper = shallow(<FavoriteComponent name={'Test script'} content={'Cypher'} onItemClick={onItemClick}/>)
    expect(wrapper.find('.favorite')).to.have.length(1)
    wrapper.find('.favorite').first().simulate('click')
    expect(onItemClick).have.been.called.with('Cypher')
  })
})
