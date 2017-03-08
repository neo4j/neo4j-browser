import { Component } from 'preact'
import { withBus } from 'react-suber'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import FrameTemplate from '../Stream/FrameTemplate'
import { SysInfoTable, SysInfoTableEntry } from 'browser-components/Tables'

export class SysInfoFrame extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: '',
      result: ''
    }
  }
  responseHandler () {
    return (res) => {
      if (!res.success) {
        this.setState({error: 'No results'})
        return
      }
      this.setState({result: ''})
    }
  }
  componentDidMount () {
    if (this.props.bus) {
      // Indexes
      this.props.bus.self(
        CYPHER_REQUEST,
        {
          query: 'CALL dbms.queryJmx("org.neo4j:*")'
        },
        this.responseHandler()
      )
    }
  }
  render () {
    const content = (
      <div>
        <SysInfoTable header={'Store Sizes'}>
          <SysInfoTableEntry label='a' value='b' />
        </SysInfoTable>
      </div>
    )
    return (
      <FrameTemplate
        header={this.props.frame}
        contents={content}
      />
    )
  }
}
export default withBus(SysInfoFrame)
