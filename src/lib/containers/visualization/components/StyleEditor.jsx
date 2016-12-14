import React from 'react'
import visualization from '../'
import { Card, CardText } from 'grommet/components/Card'
import { connect } from 'react-redux'
import {Toolbar, ToolbarTitle, ToolbarGroup} from 'grommet/components/Toolbar'
import FileDownload from 'grommet/components/svg-icons/file/file-download'
import ActionSettingsBackupRestore from 'grommet/components/svg-icons/action/settings-backup-restore'
import IconButton from 'grommet/components/IconButton'
import saveAs from 'save-as'
import fileImporter from '../../fileImporter'

class StyleEditorComponent extends React.Component {
  exportFile () {
    let saveAsFunc = this.props.saveAsFunction || saveAs
    let blob = new Blob([this.props.graphStyleData], { type: 'text/plain;charset=utf-8' })
    saveAsFunc(blob, 'graphstyle.grass')
  }

  render () {
    return (
      <Card>
        <Toolbar>
          <ToolbarTitle text={'Graph Style Sheet'}/>
          <ToolbarGroup>
            <IconButton className={'export-button'} onClick={this.exportFile.bind(this)} tooltip={"Export to file"}><FileDownload/></IconButton>
            <IconButton className={'reset-button'} onClick={this.props.reset} tooltip={"Reset to default style"}><ActionSettingsBackupRestore/></IconButton>
          </ToolbarGroup>
        </Toolbar>
        <CardText expandable={false}>
          <pre>{this.props.graphStyleData}</pre>
        </CardText>
        <fileImporter.components.FileDropBar expectedExtension={'grass'} initialMessage={'Drop a grass-file here to import'} onImportSuccess={this.props.update}/>
      </Card>
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

const StyleEditor = connect(mapStateToProps, mapDispatchToProps)(StyleEditorComponent)

export {
  StyleEditor,
  StyleEditorComponent
}
