import React from 'react'
import {
  DrawerBrowserCommand,
  DrawerExternalLink,
  DrawerSubHeader
} from 'browser-components/drawer'
import { StyledSidebarSlide } from 'browser/modules/Carousel/styled'

const title = 'all guides'
const slides = [
  <StyledSidebarSlide key="first">
    You can also access Browser guides by running
    <DrawerBrowserCommand data-populate=":guide [guide name]">
      :guide [guide name]
    </DrawerBrowserCommand>
    in the code editor.
    <DrawerSubHeader>Built-in guides</DrawerSubHeader>
    <ul className="undecorated">
      <li>
        <DrawerBrowserCommand data-exec=":guide intro">
          :guide intro
        </DrawerBrowserCommand>
        Navigating Neo4j Browser
      </li>
      <li>
        <DrawerBrowserCommand data-exec=":guide concepts">
          :guide concepts
        </DrawerBrowserCommand>
        Property graph model concepts
      </li>
      <li>
        <DrawerBrowserCommand data-exec=":guide cypher">
          :guide cypher
        </DrawerBrowserCommand>
        Cypher basics - create, match, delete
      </li>

      <li>
        <DrawerBrowserCommand data-exec=":guide movieGraph">
          :guide movieGraph
        </DrawerBrowserCommand>
        Queries and recommendations with Cypher - movie use case
      </li>

      <li>
        <DrawerBrowserCommand data-exec=":guide northwindGraph">
          :guide northwindGraph
        </DrawerBrowserCommand>
        Translate and import relation data into graph
      </li>

      <li>
        <a exec-topic="guide https://guides.neo4j.com/sandbox/movies/index.html">
          :guide https://guides.neo4j.com/sandbox/movies/index.html
        </a>
      </li>
    </ul>
    <DrawerExternalLink href="https://neo4j.com/graphgists/">
      More guides
    </DrawerExternalLink>
  </StyledSidebarSlide>
]

export default { title, slides }
