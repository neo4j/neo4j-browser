import React from 'react'
import {FileDrop} from './FileDrop'

const DropBar = (props) => {
  return (<div>{props.text}</div>)
}

export const FileDropBar = FileDrop(DropBar, true)
