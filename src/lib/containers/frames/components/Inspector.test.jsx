import React from 'react'
import { shallow } from 'enzyme'
import chai from 'chai'
import spies from 'chai-spies'
import chaiEnzyme from 'chai-enzyme'
import { InspectorComponent } from './Inspector'
import neo4jVisualization from 'neo4j-visualization'

const expect = chai.expect
chai.use(spies)
chai.use(chaiEnzyme())

describe('Inspector', () => {
  it('should render node info if item type is node', () => {
    const graphStyle = neo4jVisualization.neoGraphStyle()
    const item = {id: 1, labels: ['Movie'], properties: [{key: 'name', value: 'val'}]}
    const hoveredItem = {type: 'node', item: item}
    const wrapper = shallow(<InspectorComponent hoveredItem={hoveredItem} graphStyle={graphStyle} />)
    const listItems = wrapper.find('li')
    expect(listItems).to.have.length(3)
    console.log(listItems)
    expect(listItems.at(0).text()).to.equal('Movie')
    expect(listItems.at(1).text()).to.equal('<id>:1')
    expect(listItems.at(2).text()).to.equal('name: val')
  })
  it('should render relationship info if item type is relationship', () => {
    const graphStyle = neo4jVisualization.neoGraphStyle()
    const item = {id: 1, type: 'ACTED_IN', properties: [{key: 'name', value: 'val'}]}
    const hoveredItem = {type: 'relationship', item: item}
    const wrapper = shallow(<InspectorComponent hoveredItem={hoveredItem} graphStyle={graphStyle} />)
    const listItems = wrapper.find('li')
    expect(listItems).to.have.length(3)
    console.log(listItems)
    expect(listItems.at(0).text()).to.equal('ACTED_IN')
    expect(listItems.at(1).text()).to.equal('<id>:1')
    expect(listItems.at(2).text()).to.equal('name: val')
  })
  it('should render context menu info if item type is context menu item', () => {
    const graphStyle = neo4jVisualization.neoGraphStyle()
    const item = {label: 'label', content: 'content'}
    const hoveredItem = {type: 'context-menu-item', item: item}
    const wrapper = shallow(<InspectorComponent hoveredItem={hoveredItem} graphStyle={graphStyle} />)
    const listItems = wrapper.find('li')
    expect(listItems).to.have.length(2)
    expect(listItems.at(0).text()).to.equal('label')
    expect(listItems.at(1).text()).to.equal('content')
  })
  it('should render canvas item if item type is canvas', () => {
    const graphStyle = neo4jVisualization.neoGraphStyle()
    const item = {nodeCount: 10, relationshipCount: 15}
    const hoveredItem = {type: 'canvas', item: item}
    const wrapper = shallow(<InspectorComponent hoveredItem={hoveredItem} graphStyle={graphStyle} />)
    const listItems = wrapper.find('li')
    expect(listItems).to.have.length(1)
    expect(listItems.at(0).text()).to.equal('Displaying 10 nodes, 15 relationships.')
  })
})
