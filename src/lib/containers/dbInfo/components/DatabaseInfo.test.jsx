import React from 'react'
import ReactDOM from 'react-dom'
import ReactTestUtils from 'react-addons-test-utils'
import injectTapEventPlugin from 'react-tap-event-plugin'

import {DatabaseInfoComponent} from './DatabaseInfo'
import chai from 'chai'
import { mount } from 'enzyme'
import chaiEnzyme from 'chai-enzyme'
import spies from 'chai-spies'

injectTapEventPlugin()

// Helper for mounted touchTap events
// https://github.com/airbnb/enzyme/issues/99

function simulateEvent (wrappedTarget, eventType) {
  if (wrappedTarget.node) {
    // wrappedTarget was obtained using enzyme's mount()
    const domNode = ReactDOM.findDOMNode(wrappedTarget.node)
    ReactTestUtils.Simulate[eventType](domNode)
  } else {
    // wrappedTarget was obtained using enzyme's shallow()
    wrappedTarget.simulate(eventType)
  }
}

describe('DatabaseInfo', () => {
  const expect = chai.expect
  chai.use(spies)
  chai.use(chaiEnzyme())
  const onItemClick = chai.spy()
  describe('labels', () => {
    it('should not show labels when there are no labels', () => {
      const labels = []
      const wrapper = mount(<DatabaseInfoComponent labels={labels}/>)
      expect(wrapper.find('.token-label')).to.have.length(0)
    })
    it('should show labels when there are labels', () => {
      const labels = [{val: 'Person'}, {val: 'Movie'}]
      const wrapper = mount(<DatabaseInfoComponent labels={labels}/>)
      expect(wrapper.find('.token-label')).to.have.length(3)
      expect(wrapper.find('.token-label').first().text()).to.equal('*')
    })
    it('should call on click callback with correct cypher * label is clicked', () => {
      const labels = [{val: 'Person'}]
      const wrapper = mount(<DatabaseInfoComponent labels={labels} onItemClick={onItemClick}/>)
      simulateEvent(wrapper.find('.token-label').first(), 'touchTap')
      expect(onItemClick).have.been.called.with('MATCH (n) RETURN n LIMIT 25')
    })
    it('should call on click callback with correct cypher when a non * label is clicked', () => {
      const labels = [{val: 'Person'}]
      const wrapper = mount(<DatabaseInfoComponent labels={labels} onItemClick={onItemClick}/>)
      simulateEvent(wrapper.find('.token-label').last(), 'touchTap')
      expect(onItemClick).have.been.called.with('MATCH (n:Person) RETURN n LIMIT 25')
    })
  })

  describe('relationshipTypes', () => {
    it('should not show relationshipTypes when there are no relationshipTypes', () => {
      const relationshipTypes = []
      const wrapper = mount(<DatabaseInfoComponent relationshipTypes={relationshipTypes}/>)
      expect(wrapper.find('.token-relationship')).to.have.length(0)
    })
    it('should show relationshipTypes when there are relationshipTypes', () => {
      const relationshipTypes = [{val: 'lives'}, {val: 'knows'}]
      const wrapper = mount(<DatabaseInfoComponent relationshipTypes={relationshipTypes}/>)
      expect(wrapper.find('.token-relationship')).to.have.length(3)
      expect(wrapper.find('.token-relationship').first().text()).to.equal('*')
    })
    it('should call on click callback with correct cypher when * relationship is clicked', () => {
      const relationshipTypes = [{val: 'DIRECTED'}]
      const wrapper = mount(<DatabaseInfoComponent relationshipTypes={relationshipTypes} onItemClick={onItemClick}/>)
      simulateEvent(wrapper.find('.token-relationship').first(), 'touchTap')
      expect(onItemClick).have.been.called.with('MATCH ()-[r]->() RETURN r LIMIT 25')
    })
    it('should call on click callback with correct cypher when a non * relationship is clicked', () => {
      const relationshipTypes = [{val: 'DIRECTED'}]
      const wrapper = mount(<DatabaseInfoComponent relationshipTypes={relationshipTypes} onItemClick={onItemClick}/>)
      simulateEvent(wrapper.find('.token-relationship').last(), 'touchTap')
      expect(onItemClick).have.been.called.with('MATCH p=()-[r:DIRECTED]->() RETURN p LIMIT 25')
    })
  })

  describe('properties', () => {
    it('should not show properties when there are no properties', () => {
      const properties = []
      const wrapper = mount(<DatabaseInfoComponent properties={properties}/>)
      expect(wrapper.find('.token-property')).to.have.length(0)
    })
    it('should show properties when there are properties', () => {
      const properties = [{val: 'born'}, {val: 'name'}]
      const wrapper = mount(<DatabaseInfoComponent properties={properties}/>)
      expect(wrapper.find('.token-property')).to.have.length(2)
      expect(wrapper.find('.token-property').first().text()).to.equal('born')
    })
    it('should call on click callback with correct cypher when property is clicked', () => {
      const properties = [{val: 'born'}]
      const wrapper = mount(<DatabaseInfoComponent properties={properties} onItemClick={onItemClick}/>)
      simulateEvent(wrapper.find('.token-property').first(), 'touchTap')
      expect(onItemClick).have.been.called.with('MATCH (n) WHERE EXISTS(n.born) RETURN DISTINCT "node" as element, n.born AS born LIMIT 25 UNION ALL MATCH ()-[r]-() WHERE EXISTS(r.born) RETURN DISTINCT "relationship" AS element, r.born AS born LIMIT 25')
    })
  })
})
