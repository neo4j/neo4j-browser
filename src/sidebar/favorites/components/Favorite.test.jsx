import React from 'react'
import chai from 'chai'
import { shallow, mount } from 'enzyme'
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
    const favoriteElement = wrapper.find('.favorite')
    expect(favoriteElement).to.have.length(1)
    favoriteElement.first().simulate('click')
    expect(onItemClick).have.been.called.with('Cypher')
  })

  it('should remove favorite that has been clicked', () => {
    const id = 'SomeId'
    const expect = chai.expect
    chai.use(spies)
    chai.use(chaiEnzyme())
    const onRemoveClick = chai.spy()
    const wrapper = mount(<FavoriteComponent id={id} removeClick={onRemoveClick}/>)
    const favoriteElement = wrapper.find('.favorite')
    expect(favoriteElement).to.have.length(1)
    wrapper.find('.remove').simulate('click')
    expect(onRemoveClick).have.been.called.with('SomeId')
  })
})
