import React from 'react'
import {
  DrawerBrowserCommand,
  DrawerExternalLink,
  DrawerSubHeader
} from 'browser-components/drawer/drawer-styled'
import { BuiltInGuideSidebarSlide } from 'browser/modules/Carousel/Slide'
import { LinkContainer, MarginTop, MarginTopLi, NoBulletsUl } from './styled'

const title = '--DEFAULT_INDEX_GUIDE--'
const slides = [
  <BuiltInGuideSidebarSlide key="first">
    You can also access the built-in guides by running
    <DrawerBrowserCommand data-populate=":guide [guide name]">
      :guide [guide name]
    </DrawerBrowserCommand>
    in the Browser Editor (a.k.a. Editor).
    <MarginTop>
      <DrawerSubHeader as="div" /* prevents guide styling of h5*/>
        Built-in guides
      </DrawerSubHeader>
    </MarginTop>
    <NoBulletsUl>
      <li>
        <DrawerBrowserCommand data-exec="guide intro">
          :guide intro
        </DrawerBrowserCommand>
        <MarginTop> Intro guide: Neo4j Browser user interface guide </MarginTop>
      </li>
      <MarginTopLi>
        <DrawerBrowserCommand data-exec="guide concepts">
          :guide concepts
        </DrawerBrowserCommand>
        <MarginTop> Concepts guide: Property graph model concepts </MarginTop>
      </MarginTopLi>
      <MarginTopLi>
        <DrawerBrowserCommand data-exec="guide cypher">
          :guide cypher
        </DrawerBrowserCommand>
        <MarginTop>
          Cypher guide: Cypher basics - create, match, delete
        </MarginTop>
      </MarginTopLi>

      <MarginTopLi>
        <DrawerBrowserCommand data-exec="guide movie-graph">
          :guide movie-graph
        </DrawerBrowserCommand>
        <MarginTop>
          Movie Graph guide: Queries and recommendations with Cypher - movie use
          case
        </MarginTop>
      </MarginTopLi>

      <MarginTopLi>
        <DrawerBrowserCommand data-exec="guide northwind-graph">
          :guide northwind-graph
        </DrawerBrowserCommand>
        <MarginTop>
          Northwind Graph guide: Transform and import relational data into graph
        </MarginTop>
      </MarginTopLi>
    </NoBulletsUl>
    <LinkContainer>
      <DrawerExternalLink href="https://neo4j.com/graphgists/">
        More guides
      </DrawerExternalLink>
    </LinkContainer>
  </BuiltInGuideSidebarSlide>
]

export default { title, slides }
