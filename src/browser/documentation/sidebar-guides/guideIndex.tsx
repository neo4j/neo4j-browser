import React from 'react'
import {
  DrawerBrowserCommand,
  DrawerExternalLink,
  DrawerSubHeader
} from 'browser-components/drawer/drawer'
import { SidebarSlide } from 'browser/modules/Carousel/Slide'
import { LinkContainer, MarginTop, MarginTopLi, NoBulletsUl } from './styled'

const title = ''
const slides = [
  <SidebarSlide key="first">
    You can also access Browser guides by running
    <DrawerBrowserCommand data-populate=":guide [guide name]">
      :guide [guide name]
    </DrawerBrowserCommand>
    in the code editor.
    <MarginTop>
      <DrawerSubHeader as="div" /* prevents guide styling of h5*/>
        Built-in guides
      </DrawerSubHeader>
    </MarginTop>
    <NoBulletsUl>
      <li>
        <DrawerBrowserCommand data-exec=":guide intro">
          :guide intro
        </DrawerBrowserCommand>
        <MarginTop> Navigating Neo4j Browser </MarginTop>
      </li>
      <MarginTopLi>
        <DrawerBrowserCommand data-exec=":guide concepts">
          :guide concepts
        </DrawerBrowserCommand>
        <MarginTop> Property graph model concepts </MarginTop>
      </MarginTopLi>
      <MarginTopLi>
        <DrawerBrowserCommand data-exec=":guide cypher">
          :guide cypher
        </DrawerBrowserCommand>
        <MarginTop>Cypher basics - create, match, delete</MarginTop>
      </MarginTopLi>

      <MarginTopLi>
        <DrawerBrowserCommand data-exec=":guide movie-graph">
          :guide movie-graph
        </DrawerBrowserCommand>
        <MarginTop>
          Queries and recommendations with Cypher - movie use case
        </MarginTop>
      </MarginTopLi>

      <MarginTopLi>
        <DrawerBrowserCommand data-exec=":guide northwind-graph">
          :guide northwind-graph
        </DrawerBrowserCommand>
        <MarginTop>Translate and import relation data into graph</MarginTop>
      </MarginTopLi>
    </NoBulletsUl>
    <LinkContainer>
      <DrawerExternalLink href="https://neo4j.com/graphgists/">
        More guides
      </DrawerExternalLink>
    </LinkContainer>
  </SidebarSlide>
]

export default { title, slides }
