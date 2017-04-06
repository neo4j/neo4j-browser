import { Component } from 'preact'
import './visualization.css'

class QueryPlan extends Component {

  planInit (el) {
    if (el != null && !this.plan) {
      const NeoConstructor = neo.queryPlan
      this.plan = NeoConstructor(el)
      this.plan.display(this.props.plan)
    }
  }

  render () {
    if (!this.props.plan) {
      return
    }

    return (
      <svg display={this.props.style.display} className='neod3plan' ref={this.planInit.bind(this)} />
    )
  }
}

export default QueryPlan
