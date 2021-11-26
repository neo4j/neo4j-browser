import React from 'react'
import {
  DrawerBrowserCommand,
  DrawerExternalLink,
  DrawerSubHeader
} from 'browser-components/drawer/drawer-styled'
import { BuiltInGuideSidebarSlide } from 'browser/modules/Carousel/Slide'
import {
  LinkContainer,
  MarginTop,
  NoBulletsUl,
  Clickable,
  GuideListEntry,
  MarginBottomLi
} from 'browser/documentation/sidebar-guides/styled'
import { RemoteGuide } from 'shared/modules/guides/guidesDuck'
import docs, { BuiltInGuideIdentifier, Guide } from 'browser/documentation'
import { BinIcon } from 'browser-components/icons/Icons'

type GuidePickerProps = {
  remoteGuides: RemoteGuide[]
  setCurrentGuide: (guide: Guide) => void
  fetchRemoteGuide: (identifier: string) => void
  updateRemoteGuides: (newList: RemoteGuide[]) => void
}

const builtInGuides: {
  identifier: BuiltInGuideIdentifier
  description: string
}[] = [
  { identifier: 'intro', description: 'Navigating Neo4j Browser' },
  { identifier: 'concepts', description: 'Property graph model concepts' },
  {
    identifier: 'cypher',
    description: 'Cypher basics - create, match, delete'
  },
  {
    identifier: 'movie-graph',
    description: 'Queries and recommendations with Cypher - movie use case}'
  },
  {
    identifier: 'northwind-graph',
    description: 'Translate and import relation data into graph'
  }
]

const GuidePicker = ({
  remoteGuides,
  setCurrentGuide,
  fetchRemoteGuide,
  updateRemoteGuides
}: GuidePickerProps): JSX.Element => (
  <BuiltInGuideSidebarSlide>
    You can also access Browser guides by running
    <DrawerBrowserCommand data-populate=":guide [guide name]">
      :guide [guide name]
    </DrawerBrowserCommand>
    in the code editor.
    <MarginTop pixels={25}>
      <DrawerSubHeader as="div" /* prevents guide styling of h5*/>
        Built-in guides
      </DrawerSubHeader>
    </MarginTop>
    <NoBulletsUl>
      {builtInGuides.map(({ identifier, description }) => (
        <MarginBottomLi
          data-testid={`builtInGuide${identifier}`}
          key={identifier}
          onClick={() =>
            setCurrentGuide({
              ...docs.guide.chapters[identifier],
              identifier,
              currentSlide: 0
            })
          }
        >
          <DrawerBrowserCommand>:guide {identifier}</DrawerBrowserCommand>
          <MarginTop> {description} </MarginTop>
        </MarginBottomLi>
      ))}
    </NoBulletsUl>
    {remoteGuides.length !== 0 && (
      <>
        <MarginTop pixels={25}>
          <DrawerSubHeader
            as="div" /* prevents guide styling of h5*/
            data-testid="remoteGuidesTitle"
          >
            Remote Guides
          </DrawerSubHeader>
        </MarginTop>
        <NoBulletsUl>
          {remoteGuides.map(guide => (
            <GuideListEntry key={guide.identifier}>
              <DrawerBrowserCommand
                data-testid={`remoteGuide${guide.identifier}`}
                onClick={() => fetchRemoteGuide(guide.identifier)}
              >
                {guide.title}
              </DrawerBrowserCommand>
              <Clickable
                data-testid={`removeGuide${guide.identifier}`}
                onClick={() => {
                  updateRemoteGuides(
                    remoteGuides.filter(
                      ({ identifier }) => identifier !== guide.identifier
                    )
                  )
                }}
              >
                <BinIcon />
              </Clickable>
            </GuideListEntry>
          ))}
        </NoBulletsUl>
      </>
    )}
    <LinkContainer>
      <DrawerExternalLink href="https://neo4j.com/graphgists/">
        More guides
      </DrawerExternalLink>
    </LinkContainer>
  </BuiltInGuideSidebarSlide>
)

export default GuidePicker
