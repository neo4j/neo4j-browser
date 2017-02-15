import React from 'react'
import FrameTemplate from './FrameTemplate'
import Button from 'grommet/components/Button'
import Sidebar from 'grommet/components/Sidebar'
import TableIcon from 'grommet/components/icons/base/Table'
import QueryPlan from './Planner/QueryPlan'
import TableView from './Views/TableView'
import AsciiView from './Views/AsciiView'
import bolt from 'services/bolt/bolt'
import Visualization from './Visualization'
import styles from './style_sidebar.css'

class CypherFrame extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      openView: 'table'
    }
  }

  onNavClick (viewName) {
    this.setState({openView: viewName})
  }

  shouldComponentUpdate (nextProps) {
    return nextProps.frame.result !== this.props.frame.result
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.frame.result !== this.props.frame.result) {
      this.state.rows = bolt.recordsToTableArray(nextProps.frame.result.records)
      this.state.plan = bolt.extractPlan(nextProps.frame.result)
    }
  }

  sidebar () {
    return (
      <Sidebar className={styles.sidebar} colorIndex='neutral-1' full={false}>
        <Button primary={this.state.openView === 'table'} icon={<TableIcon />} onClick={() => {
          this.setState({openView: 'table'})
        }} />
        <Button primary={this.state.openView === 'text'} label={'A'} plain onClick={() => {
          this.setState({openView: 'text'})
        }} />
      <Button primary={this.state.openView === 'visualization'} label={'hmm'} plain onClick={() => {
          this.setState({openView: 'visualization'})
        }} />
      </Sidebar>
    )
  }

  render () {
    const frame = this.props.frame
    const errors = frame.error && frame.error.fields || false
    const result = frame.result || false
    const plan = this.state.plan || bolt.extractPlan(result)

    let frameContents = <pre>{JSON.stringify(result, null, 2)}</pre>
    if (result.records && result.records.length > 0) {
      if (plan) {
        frameContents = <QueryPlan plan={plan} />
      } else {
        this.state.rows = this.state.rows || bolt.recordsToTableArray(result.records)
        frameContents = (<div>
          <Visualization records={result.records} />
          <pre>{asciitable.table(this.state.rows)}</pre>
        </div>)
        switch (this.state.openView) {
          case 'text':
            frameContents = <AsciiView rows={this.state.rows} />
            break
          case 'table':
            frameContents = <TableView data={this.state.rows} />
            break
          case 'visualization':
            frameContents = (<div>
              <Visualization records={result.records} />
            </div>)
          default:
            frameContents = <TableView data={this.state.rows} />
        }
      }
    } else if (errors) {
      frameContents = (
        <div>
          {errors[0].code}
          <pre>{errors[0].message}</pre>
        </div>
      )
    } else if (result) {
      frameContents = (
        <div>
          <pre>{JSON.stringify(frame, null, '\t')}</pre>
        </div>
      )
    }
    return (
      <FrameTemplate
        sidebar={this.sidebar.bind(this)}
        header={frame}
        contents={frameContents}
      />
    )
  }
}
export default CypherFrame
