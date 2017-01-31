import React from 'react'
import { connect } from 'react-redux'
import asciitable from 'ascii-data-table'
import { FrameTitlebar } from './FrameTitlebar'
import FrameTemplate from './FrameTemplate'
import * as dataSource from 'shared/modules/dataSource/dataSourceDuck'

export const WidgetFrame = (props) => {
  const ds = props.getDataSource(props.frame.result)
  const latest = ds.result.result
  const res = !latest || typeof latest === 'string' ? latest : latest.records[0].get(0)
  const frameContents = (
    <pre>{
      asciitable.run([
        ['dataSource', 'latest result'],
        [ds.name, res]
      ])
    }</pre>
  )
  return (
    <FrameTemplate
      className='playFrame'
      header={<FrameTitlebar frame={props.frame} />}
      contents={frameContents}
    />
  )
}

const mapStateToProps = (state) => {
  return {
    getDataSource: (id) => dataSource.getDataSourceById(state, id)
  }
}

export default connect(mapStateToProps)(WidgetFrame)
