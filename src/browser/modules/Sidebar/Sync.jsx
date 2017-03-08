/* global confirm */
import React from 'react'
import { withBus } from 'preact-suber'
import { CLEAR_LOCALSTORAGE } from 'shared/modules/localstorage/localstorageDuck'
import {Drawer, DrawerBody, DrawerHeader} from 'browser-components/drawer'

export const Sync = ({bus}) => {
  return (
    <Drawer id='sync'>
      <DrawerHeader title='Neo4j Browser Sync' />
      <DrawerBody>
        <button onClick={() => {
          if (confirm('You will now clear the data stored in this web browser.')) {
            bus.send(CLEAR_LOCALSTORAGE)
          }
        }}> Clear localstorage</button>
      </DrawerBody>
    </Drawer>
  )
}

export default withBus(Sync)
