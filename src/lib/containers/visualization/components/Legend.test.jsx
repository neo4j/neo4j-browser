import React from 'react'
import { shallow } from 'enzyme'
import chai from 'chai'
import spies from 'chai-spies'
import chaiEnzyme from 'chai-enzyme'
import { LegendComponent } from './Legend'
import neo4jVisualization from 'neo4j-visualization'

const expect = chai.expect
chai.use(spies)
chai.use(chaiEnzyme())

describe('Legend', () => {
  const label1 = 'Person' + Math.random()
  const label2 = 'Actor' + Math.random()
  const type1 = 'ACTED_IN' + Math.random()
  const type2 = 'ACTED_IN' + Math.random()
  let graphStyle
  let stats
  let wrapper
  let labelClickHandler
  let relTypeClickHandler

  beforeEach(() => {
    labelClickHandler = chai.spy()
    relTypeClickHandler = chai.spy()
    graphStyle = neo4jVisualization.neoGraphStyle()
    stats = {nodeCount: 3, relCount: 3, labels: {[label1]: 2, [label2]: 1}, relTypes: {[type1]: 10, [type2]: 15}}
    wrapper = shallow(<LegendComponent stats={stats} graphStyle={graphStyle} labelClickHandler={labelClickHandler} relTypeClickHandler={relTypeClickHandler} />)
  })

  it('should show node labels and counts', () => {
    const rows = wrapper.find('ul')
    expect(rows).to.have.length(2)
    const labelStats = rows.at(0).find('li')
    expect(labelStats).have.length(2)
    expect(labelStats.at(0).text()).to.equal(`${label1}(2)`)
    expect(labelStats.at(1).text()).to.equal(`${label2}(1)`)
  })
  it('should show relationship types and counts', () => {
    const rows = wrapper.find('ul')
    expect(rows).to.have.length(2)
    const relTypeStats = rows.at(1).find('li')
    expect(relTypeStats).have.length(2)
    expect(relTypeStats.at(0).text()).to.equal(`${type1}(10)`)
    expect(relTypeStats.at(1).text()).to.equal(`${type2}(15)`)
  })
})
