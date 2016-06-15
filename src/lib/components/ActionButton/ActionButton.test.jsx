import React from 'react'
import { shallow } from 'enzyme'
import chai from 'chai'
import spies from 'chai-spies'
import chaiEnzyme from 'chai-enzyme'
import ActionButton from './'

const expect = chai.expect
chai.use(spies)
chai.use(chaiEnzyme())

describe('ActionButton component', () => {
  it('should render a button with label', () => {
    const props = {onClick: () => {}, label: 'X'}
    const wrapper = shallow(<ActionButton {...props} />)
    expect(wrapper.find('button')).to.have.length(1)
    expect(wrapper.find('button').text()).to.equal('X')
  })

  it('should render a button with tooltip / title', () => {
    const props = {onClick: () => {}, label: 'X', tooltip: 'Hey!'}
    const wrapper = shallow(<ActionButton {...props} />)
    expect(wrapper.find('button')).to.have.length(1)
    expect(wrapper.find('button').props().title).to.equal(props.tooltip)
  })

  it('should render a disabled button', () => {
    const props = {onClick: () => {}, label: 'X', disabled: true}
    const wrapper = shallow(<ActionButton {...props} />)
    expect(wrapper.find('button')).to.have.length(1)
    expect(wrapper.find('button').props().disabled).to.equal('disabled')
  })

  it('should render a button with a provided classNames', () => {
    const props = {onClick: () => {}, label: 'X', classNames: ['first-class', 'second-class']}
    const wrapper = shallow(<ActionButton {...props} />)
    expect(wrapper.find('button')).to.have.length(1)
    expect(wrapper.find('button').hasClass('first-class')).to.equal(true)
    expect(wrapper.find('button').hasClass('second-class')).to.equal(true)
  })

  it('should handle clicks', () => {
    const handleClick = chai.spy()
    const props = {onClick: handleClick, label: 'X'}
    const wrapper = shallow(<ActionButton {...props} />)
    wrapper.find('button').simulate('click')
    expect(handleClick).to.have.been.called
  })
})
