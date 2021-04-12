import React from 'react'
import { DrawerBrowserCommand } from 'browser-components/drawer'
import { StyledSidebarSlide } from 'browser/modules/Carousel/styled'

const title = 'all guides'
const slides = [
  <StyledSidebarSlide key="first">
    <h3>Guides in Neo4j Browser</h3>
    You can start guides by running:
    <DrawerBrowserCommand data-populate=":guide [guide name]">
      :guide [guide name]
    </DrawerBrowserCommand>
    <ul className="undecorated">
      <DrawerBrowserCommand data-exec=":guide movies">
        :guide movies
      </DrawerBrowserCommand>
      <li>
        a guide about getting started
        <a exec-topic="guide intro">:guide intro</a>
      </li>
      <li>
        a guide about movies
        <a exec-topic="guide movies">:guide movies</a>
      </li>

      <li>
        <a exec-topic="guide https://guides.neo4j.com/sandbox/movies/index.html">
          :guide https://guides.neo4j.com/sandbox/movies/index.html
        </a>
      </li>
    </ul>
  </StyledSidebarSlide>
]

export default { title, slides }
