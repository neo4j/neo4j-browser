import React from 'react'
import {DatabaseInfoComponent} from './DatabaseInfo'
import chai from 'chai'
import { mount } from 'enzyme'
import chaiEnzyme from 'chai-enzyme'
import spies from 'chai-spies'

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
      const labels = ['Person', 'Movie']
      const wrapper = mount(<DatabaseInfoComponent labels={labels}/>)
      expect(wrapper.find('.token-label')).to.have.length(3)
      expect(wrapper.find('.token-label').first().text()).to.equal('*')
    })
    it('should call on click callback with correct cypher * label is clicked', () => {
      const labels = ['Person']
      const wrapper = mount(<DatabaseInfoComponent labels={labels} onItemClick={onItemClick}/>)
      wrapper.find('.token-label').first().simulate('click')
      expect(onItemClick).have.been.called.with('MATCH (n) RETURN n LIMIT 25')
    })
    it('should call on click callback with correct cypher when a non * label is clicked', () => {
      const labels = ['Person']
      const wrapper = mount(<DatabaseInfoComponent labels={labels} onItemClick={onItemClick}/>)
      wrapper.find('.token-label').last().simulate('click')
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
      const relationshipTypes = ['lives', 'knows']
      const wrapper = mount(<DatabaseInfoComponent relationshipTypes={relationshipTypes}/>)
      expect(wrapper.find('.token-relationship')).to.have.length(3)
      expect(wrapper.find('.token-relationship').first().text()).to.equal('*')
    })
    it('should call on click callback with correct cypher when * relationship is clicked', () => {
      const relationshipTypes = ['DIRECTED']
      const wrapper = mount(<DatabaseInfoComponent relationshipTypes={relationshipTypes} onItemClick={onItemClick}/>)
      wrapper.find('.token-relationship').first().simulate('click')
      expect(onItemClick).have.been.called.with('MATCH ()-[r]->() RETURN r LIMIT 25')
    })
    it('should call on click callback with correct cypher when a non * relationship is clicked', () => {
      const relationshipTypes = ['DIRECTED']
      const wrapper = mount(<DatabaseInfoComponent relationshipTypes={relationshipTypes} onItemClick={onItemClick}/>)
      wrapper.find('.token-relationship').last().simulate('click')
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
      const properties = ['born', 'name']
      const wrapper = mount(<DatabaseInfoComponent properties={properties}/>)
      expect(wrapper.find('.token-property')).to.have.length(2)
      expect(wrapper.find('.token-property').first().text()).to.equal('born')
    })
    it('should call on click callback with correct cypher when property is clicked', () => {
      const properties = ['born']
      const wrapper = mount(<DatabaseInfoComponent properties={properties} onItemClick={onItemClick}/>)
      wrapper.find('.token-property').first().simulate('click')
      expect(onItemClick).have.been.called.with('MATCH (n) WHERE EXISTS(n.born) RETURN DISTINCT "node" as element, n.born AS born LIMIT 25 UNION ALL MATCH ()-[r]-() WHERE EXISTS(r.born) RETURN DISTINCT "relationship" AS element, r.born AS born LIMIT 25')
    })
  })
})
