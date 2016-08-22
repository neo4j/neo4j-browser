import React from 'react'
import { connect } from 'react-redux'
import editor from 'containers/editor'
import { LabelItems, RelationshipItems, PropertyItems } from './MetaItems'
import {List, ListItem} from 'material-ui/List'

import styles from './style_meta.css'

const DatabaseInfoComponent = ({ labels = [], relationshipTypes = [], properties = [], onItemClick }) => {
  return (
    <div id='db-drawer'>
      <h3> Database Information</h3>
      <List>
        <ListItem className={styles.section} disabled>
          <LabelItems labels={labels.map((l) => l.val)} onItemClick={onItemClick}/>
        </ListItem>
        <ListItem className={styles.section} disabled>
          <RelationshipItems relationshipTypes={relationshipTypes.map((l) => l.val)} onItemClick={onItemClick}/>
        </ListItem>
        <ListItem className={styles.section} disabled>
          <PropertyItems properties={properties.map((l) => l.val)} onItemClick={onItemClick}/>
        </ListItem>
      </List>
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
