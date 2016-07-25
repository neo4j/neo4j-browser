import React from 'react'
import { shallow } from 'enzyme'
import chai from 'chai'
import spies from 'chai-spies'
import chaiEnzyme from 'chai-enzyme'
import neo4jVisualization from 'neo4j-visualization'
import { GrassEditorComponent } from './GrassEditor'

const expect = chai.expect
chai.use(spies)
chai.use(chaiEnzyme())

describe('grass editor', () => {
  let updateGraphStyleData
  let graphStyle
  let labels
  let relTypes
  let wrapper
  beforeEach(() => {
    graphStyle = neo4jVisualization.neoGraphStyle()
    updateGraphStyleData = (newData) => {
      graphStyle.loadRules(newData)
    }
    labels = [{val: 'label1'}]
    relTypes = [{val: 'type1'}]
    const graphStyleData = graphStyle.toSheet()
    wrapper = shallow(<GrassEditorComponent meta={{labels: labels, relationshipTypes: relTypes}} graphStyleData={graphStyleData} update={updateGraphStyleData} />)
  })

  describe('node label style editing', () => {
    it('should display styling pickers when label selector is picked', () => {
      expect(wrapper.find('.token-label')).to.have.length(1)
      wrapper.find('.token-label').at(0).simulate('click')
      expect(wrapper.find('.color-picker-item')).to.have.length(graphStyle.defaultColors().length)
      expect(wrapper.find('.size-picker-item')).to.have.length(graphStyle.defaultSizes().length)
      expect(wrapper.find('.icon-picker-item')).to.have.length(graphStyle.defaultIconCodes().length)
    })
    it('should update graphstyle data with color change for label', () => {
      expect(graphStyle.forNode({labels: ['label1']}).get('color')).to.not.equal(graphStyle.defaultColors()[2].color)
      wrapper.find('.token-label').at(0).simulate('click')
      wrapper.find('.color-picker-item').at(2).simulate('click')
      expect(graphStyle.forNode({labels: ['label1']}).get('color')).to.equal(graphStyle.defaultColors()[2].color)
    })
    it('should update graphstyle data with size change for label', () => {
      expect(graphStyle.forNode({labels: ['label1']}).get('diameter')).to.not.equal(graphStyle.defaultSizes()[1].diameter)
      wrapper.find('.token-label').at(0).simulate('click')
      wrapper.find('.size-picker-item').at(1).simulate('click')
      expect(graphStyle.forNode({labels: ['label1']}).get('diameter')).to.equal(graphStyle.defaultSizes()[1].diameter)
    })
    it('should change update graphstyle data with size change for label', () => {
      expect(graphStyle.forNode({labels: ['label1']}).get('diameter')).to.not.equal(graphStyle.defaultSizes()[1].diameter)
      wrapper.find('.token-label').at(0).simulate('click')
      wrapper.find('.icon-picker-item').at(1).simulate('click')
      expect(graphStyle.forNode({labels: ['label1']}).get('icon-code')).to.equal(graphStyle.defaultIconCodes()[1]['icon-code'])
    })
  })
  describe('relationship type style editing', () => {
    it('should display styling pickers when relationship selector is picked', () => {
      expect(wrapper.find('.token-relationship')).to.have.length(1)
      wrapper.find('.token-relationship').at(0).simulate('click')
      expect(wrapper.find('.color-picker-item')).to.have.length(graphStyle.defaultColors().length)
      expect(wrapper.find('.width-picker-item')).to.have.length(graphStyle.defaultArrayWidths().length)
    })
    it('should update graphstyle data with color change for relationship type', () => {
      expect(graphStyle.forRelationship({type: 'type1'}).get('color')).to.not.equal(graphStyle.defaultColors()[2].color)
      wrapper.find('.token-relationship').at(0).simulate('click')
      wrapper.find('.color-picker-item').at(2).simulate('click')
      expect(graphStyle.forRelationship({type: 'type1'}).get('color')).to.equal(graphStyle.defaultColors()[2].color)
    })
    it('should update graphstyle data with shaft-width change for relationship type', () => {
      expect(graphStyle.forRelationship({type: 'type1'}).get('shaft-width')).to.not.equal(graphStyle.defaultArrayWidths()[1]['shaft-width'])
      wrapper.find('.token-relationship').at(0).simulate('click')
      wrapper.find('.width-picker-item').at(1).simulate('click')
      expect(graphStyle.forRelationship({type: 'type1'}).get('shaft-width')).to.equal(graphStyle.defaultArrayWidths()[1]['shaft-width'])
    })
  })
})
