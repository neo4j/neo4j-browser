import React from 'react'
import { FrameTitlebar } from './FrameTitlebar'
import asciitable from 'ascii-data-table'
import bolt from '../../../services/bolt/bolt'
import tabNavigation from '../../../tabNavigation'

class CypherFrame extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      openView: 'text'
    }
  }

  onNavClick (viewName) {
    this.setState({openView: viewName})
  }
  render () {
    const handleTitlebarClick = this.props.handleTitlebarClick
    const frame = this.props.frame
    const errors = frame.errors && frame.errors.fields || false
    const result = frame.result || false
    let frameContents = <pre>{JSON.stringify(result, null, 2)}</pre>
    if (result) {
      const Text = () => {
        const rows = bolt.recordsToTableArray(result.records)
        return <div className='frame'><pre>{asciitable.run(rows)}</pre></div>
      }
      const Code = () => {
        return <div className='frame'><pre>{JSON.stringify(result, null, 2)}</pre></div>
      }
      const navItemsList = [
        {name: 'CODE', icon: '', content: Code},
        {name: 'TEXT', icon: '', content: Text}
      ]
      frameContents = <tabNavigation.components.Navigation openDrawer={this.state.openView} navItems={navItemsList} onNavClick={this.onNavClick.bind(this)} styleId='cypherTabs'/>
    } else if (errors) {
      frameContents = (
        <div>
          {errors[0].code}
          <pre>{errors[0].message}</pre>
        </div>
      )
    }
    return (
      <div className='frame'>
        <FrameTitlebar handleTitlebarClick={() => handleTitlebarClick(frame.cmd)} frame={frame} />
        <div className='frame-contents'>{frameContents}</div>
      </div>
    )
  }
}

export {
  CypherFrame
}
