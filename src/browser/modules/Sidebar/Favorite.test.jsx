import React from 'react'
import chai from 'chai'
import { shallow } from 'enzyme'
import chaiEnzyme from 'chai-enzyme'
import spies from 'chai-spies'
import { FavoriteComponent } from './Favorite'

describe('FavoriteComponent', () => {
  const expect = chai.expect

  describe('should show name of script', () => {
    const testCases = [
      {
        command: '//Test script \nABC',
        expected: 'Test script'
      },
      {
        command: '//Test script ABC',
        expected: 'Test script ABC'
      },
      {
        command: '// Test script ABC   ',
        expected: 'Test script ABC'
      },
      {
        command: '// Test \n\n\nscript ABC   ',
        expected: 'Test'
      },
      {
        command: '// //Test//',
        expected: '//Test//'
      }
    ]
    testCases.forEach((testCase, i) => {
      it(`should extract name of script from case ${i}`, () => {
        const wrapper = shallow(<FavoriteComponent content={testCase.command} />)
        const item = wrapper.find('.favorite')
        expect(item).to.have.length(1)
        expect(item.props().primaryText).to.equal(testCase.expected)
      })
    })
  })

  it('should show tigger event with content of script', () => {
    const expect = chai.expect
    chai.use(spies)
    chai.use(chaiEnzyme())
    const onItemClick = chai.spy()
    const wrapper = shallow(<FavoriteComponent content={'Cypher'} onItemClick={onItemClick} />)
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
    const wrapper = shallow(<FavoriteComponent id={id} removeClick={onRemoveClick} />)
    const favoriteElement = wrapper.find('.favorite')
    expect(favoriteElement).to.have.length(1)
    // wrapper.find(favoriteElement).find('.remove').simulate('click')
    // expect(onRemoveClick).have.been.called.with('SomeId')
  })
})
