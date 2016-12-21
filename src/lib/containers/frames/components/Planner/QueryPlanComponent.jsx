import React from 'react'
import './visualization.css'

export class QueryPlanComponent extends React.Component {

  planInit (el) {
    if (el != null && !this.plan) {
      const NeoConstructor = neo.queryPlan
      this.plan = NeoConstructor(el)
      this.plan.display(this.props.plan)
    }
  }

  render () {
    return (
      <svg className='neod3plan' ref={this.planInit.bind(this)}>
      </svg>
    )
  }
}

QueryPlanComponent.propTypes = {
  plan: React.PropTypes.object.isRequired
}
