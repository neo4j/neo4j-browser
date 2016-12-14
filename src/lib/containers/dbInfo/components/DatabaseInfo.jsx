import React from 'react'
import { connect } from 'react-redux'
import editor from 'containers/editor'
import { LabelItems, RelationshipItems, PropertyItems } from './MetaItems'
import ListItem from 'grommet/components/ListItem'
import {Drawer, DrawerBody, DrawerHeader} from 'nbnmui/drawer'

import styles from './style_meta.css'

const DatabaseInfoComponent = ({ labels = [], relationshipTypes = [], properties = [], onItemClick }) => {
  return (
    <Drawer id='db-drawer'>
      <DrawerHeader title='Database Information' />
      <DrawerBody>
        <ListItem className={styles.section} disabled>
          <LabelItems labels={labels.map((l) => l.val)} onItemClick={onItemClick} />
        </ListItem>
        <ListItem className={styles.section} disabled>
          <RelationshipItems relationshipTypes={relationshipTypes.map((l) => l.val)} onItemClick={onItemClick} />
        </ListItem>
        <ListItem className={styles.section} disabled>
          <PropertyItems properties={properties.map((l) => l.val)} onItemClick={onItemClick} />
        </ListItem>
      </DrawerBody>
    </Drawer>
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
