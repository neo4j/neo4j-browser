import React from 'react'
import DatabaseInfo from './DatabaseInfo'
import { expect } from 'chai'
import { shallow } from 'enzyme'

describe('DatabaseDrawer', () => {
  it('should not show labels when there are no labels', () => {
    const labels = []
    const wrapper = shallow(<DatabaseInfo labels={labels}/>)
    expect(wrapper.find('.token-label')).to.have.length(0)
  })
  it('should show labels when there are labels', () => {
    const labels = ['Person', 'Movie']
    const wrapper = shallow(<DatabaseInfo labels={labels}/>)
    expect(wrapper.find('.token-label')).to.have.length(3)
    expect(wrapper.find('.token-label').first().text()).to.equal('*')
  })
})
