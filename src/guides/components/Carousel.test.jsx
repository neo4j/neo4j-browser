import React from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import {Carousel} from './Carousel'
import {expect} from 'chai'
import {mount} from 'enzyme'

describe('Carousel', () => {
  it('should render carousel when html has `slide` tag', () => {
    const html = '<slide>Hello</slide>'
    const wrapper = mount(<MuiThemeProvider><Carousel html={html}/></MuiThemeProvider>)
    expect(wrapper.find(Carousel)).to.have.length(1)
    expect(wrapper.find('.slide')).to.have.length(1)
  })
})
