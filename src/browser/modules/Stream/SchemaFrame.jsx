import { Component } from 'preact'
import { withBus } from 'preact-suber'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import FrameTemplate from '../Stream/FrameTemplate'
import Visible from 'browser-components/Visible'

export class SchemaFrame extends Component {
  constructor (props) {
    super(props)
    this.state = {
      indexes: [],
      constraints: []
    }
  }
  responseHandler (name) {
    return (res) => {
      if (!res.success || !res.result || !res.result.records.length) {
        this.setState({ [name]: [] })
        return
      }
      const out = res.result.records.map((rec) => rec.get('description'))
      this.setState({ [name]: out })
    }
  }
  componentDidMount () {
    if (this.props.bus) {
      // Indexes
      this.props.bus.self(
        CYPHER_REQUEST,
        {
          query: 'CALL db.indexes()'
        },
        this.responseHandler('indexes')
      )
      // Contraints
      this.props.bus.self(
        CYPHER_REQUEST,
        {
          query: 'CALL db.constraints()'
        },
        this.responseHandler('constraints')
      )
    }
  }
  render () {
    const indexes = this.state.indexes.map((index, i) => {
      return <div key={i}>{index}</div>
    })
    const constraints = this.state.constraints.map((con, i) => {
      return <div key={i}>{con}</div>
    })
    const schema = (
      <div>
        <h3>Indexes</h3>
        <Visible if={this.state.indexes.length}><div>{indexes}</div></Visible>
        <Visible if={!this.state.indexes.length}>
          <span>No indexes</span>
        </Visible>
        <br />
        <h3>Constraints</h3>
        <Visible if={this.state.constraints.length}><div>{constraints}</div></Visible>
        <Visible if={!this.state.constraints.length}>
          <span>No constraints</span>
        </Visible>
      </div>
    )
    return (
      <FrameTemplate
        header={this.props.frame}
        contents={schema}
      />
    )
  }
}
export default withBus(SchemaFrame)
