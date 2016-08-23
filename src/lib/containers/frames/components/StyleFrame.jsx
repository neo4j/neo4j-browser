import React from 'react'
import { FrameTitlebar } from './FrameTitlebar'
import FrameTemplate from './FrameTemplate'
import visualization from '../../visualization'
import { Card, CardText } from 'material-ui/Card'
import { connect } from 'react-redux'
import {Toolbar, ToolbarTitle, ToolbarGroup} from 'material-ui/Toolbar'
import FileDownload from 'material-ui/svg-icons/file/file-download'
import ActionSettingsBackupRestore from 'material-ui/svg-icons/action/settings-backup-restore'
import IconButton from 'material-ui/IconButton'
import saveAs from 'save-as'
import fileImporter from '../../fileImporter'

class StyleFrameComponent extends React.Component {
  exportFile () {
    let blob = new Blob([this.props.graphStyleData], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'graphstyle.grass')
  }

  reset () {

  }

  render () {
    const frame = this.props.frame
    const frameContents = (
      <Card>
        <Toolbar>
          <ToolbarTitle text={'Graph Style Sheet'}/>
          <ToolbarGroup>
            <IconButton onClick={this.exportFile.bind(this)} tooltip={"Export to file"}><FileDownload/></IconButton>
            <IconButton onClick={this.props.reset} tooltip={"Reset to default style"}><ActionSettingsBackupRestore/></IconButton>
          </ToolbarGroup>
        </Toolbar>
        <CardText expandable={false}>
          <pre>{this.props.graphStyleData}</pre>
        </CardText>
        <fileImporter.components.FileDropBar initialMessage={'Drop a grass-file here to import'} onImportSuccess={this.props.update}/>
      </Card>
    )
    return (
      <FrameTemplate
        header={<FrameTitlebar frame={frame} />}
        contents={frameContents}
      />
    )
  }
}

const mapStateToProps = (state) => {
  return {
    graphStyleData: visualization.selectors.getGraphStyleData(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    update: (data) => {
      dispatch(visualization.actions.updateGraphStyleData(data))
    },
    reset: () => {
      dispatch(visualization.actions.resetGraphStyleData())
    }
  }
}

const StyleFrame = connect(mapStateToProps, mapDispatchToProps)(StyleFrameComponent)

export {
  StyleFrame
}
