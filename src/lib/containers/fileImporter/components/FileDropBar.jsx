import React from 'react'
import {Toolbar, ToolbarTitle, ToolbarGroup} from 'grommet/components/Toolbar'
import {FileDrop} from './FileDrop'

const DropBar = (props) => {
  return (<div>
    <Toolbar>
      <ToolbarGroup>
        <ToolbarTitle text={props.text} />
      </ToolbarGroup>
    </Toolbar>
  </div>)
}

export const FileDropBar = FileDrop(DropBar, true)
