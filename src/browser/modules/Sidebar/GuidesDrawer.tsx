/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useRef } from 'react'
import { connect } from 'react-redux'

import { DrawerBody, DrawerHeader } from 'browser-components/drawer'
import {
  getGuide,
  startGuide,
  Guide,
  defaultGuide
} from 'shared/modules/guides/guidesDuck'
import { GlobalState } from 'shared/globalState'
import { GuideContent, StyledHeaderContainer, WideDrawer } from './styled'
import GuidesCarousel from '../GuideCarousel/GuideCarousel'
import { BackIcon } from '../../components/icons/Icons'

type GuidesDrawerProps = { guide: Guide; backToAllGuides: () => void }
function GuidesDrawer({
  guide,
  backToAllGuides
}: GuidesDrawerProps): JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null)
  return (
    <WideDrawer id="guide-drawer" ref={scrollRef}>
      <DrawerHeader>
        {guide.title !== defaultGuide.title && (
          <span onClick={backToAllGuides}>
            <BackIcon width={16} />
          </span>
        )}
        Neo4j Browser Guides
      </DrawerHeader>
      <DrawerBody>
        <GuideContent>
          <GuidesCarousel
            slides={guide.slides}
            scrollToTop={() =>
              scrollRef.current?.scrollIntoView({ block: 'start' })
            }
          />
        </GuideContent>
      </DrawerBody>
    </WideDrawer>
  )
}
const mapStateToProps = (state: GlobalState) => ({ guide: getGuide(state) })
const mapDispatchToProps = (dispatch: any) => ({
  backToAllGuides: () => dispatch(startGuide())
})
const ConnectedGuidesDrawer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GuidesDrawer)
export default ConnectedGuidesDrawer
