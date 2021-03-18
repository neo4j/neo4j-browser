import React from 'react'
import { DrawerBrowserCommand } from 'browser-components/drawer'
import Slide from 'browser/modules/Carousel/Slide'

const title = 'all guides'
const slides = [
  <Slide key="first">
    use the dropdown to pick a guide
    <br />
    You can also access Browser guides by running
    <DrawerBrowserCommand> :play {'<guide_name>'} </DrawerBrowserCommand>
    in the main editor
  </Slide>
]

export default { title, slides }
