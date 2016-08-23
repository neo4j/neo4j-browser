import React from 'react'
import {Toolbar, ToolbarTitle, ToolbarGroup} from 'material-ui/Toolbar'
import {FileDrop} from './FileDrop'

const DropBar = (props) => {
  return (<div>
    <Toolbar>
      <ToolbarGroup>
        <ToolbarTitle text={props.text}/>
      </ToolbarGroup>
    </Toolbar>
  </div>)
}

export const FileDropBar = FileDrop(DropBar, true)
