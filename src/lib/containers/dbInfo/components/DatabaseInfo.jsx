import React from 'react'
import { connect } from 'react-redux'
import editor from '../../../../lib/containers/editor'
import { LabelItems, RelationshipItems, PropertyItems } from './MetaItems'

const DatabaseInfoComponent = ({ labels = [], relationshipTypes = [], properties = [], onItemClick }) => {
  return (
    <div id='db-drawer'>
      <h4> Database Information</h4>
      <LabelItems labels={labels.map((l) => l.val)} onItemClick={onItemClick}/>
      <RelationshipItems relationshipTypes={relationshipTypes.map((l) => l.val)} onItemClick={onItemClick}/>
      <PropertyItems properties={properties.map((l) => l.val)} onItemClick={onItemClick}/>
    </div>
  )
}

const mapStateToProps = (state) => {
  return state.meta || {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    onItemClick: (cmd) => {
      dispatch(editor.actions.setContent(cmd))
    }
  }
}

const DatabaseInfo = connect(mapStateToProps, mapDispatchToProps)(DatabaseInfoComponent)
export {
  DatabaseInfoComponent,
  DatabaseInfo
}
