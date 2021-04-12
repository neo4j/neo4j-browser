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

import React from 'react'
import { DrawerBody, DrawerHeader } from 'browser-components/drawer'
import { connect } from 'react-redux'
import { getGuide, startGuide } from 'shared/modules/guides/guidesDuck'
import { GlobalState } from 'shared/globalState'
import { Guide } from '../../../shared/modules/guides/guidesDuck'
import GuideCarousel from './GuideCarousel'
import { GuideContent, WideDrawer } from './styled'

// TODO fix styling issue when guide is longer than 100vh
// TODO there's no autocompletion for :guide
// TODO drawer width
// TODO it all looks ugly
// TODO test and check for all things that can go wrong
// TODO format guides to fit better
// TODO handle there only being one slide
// known bugs, drops out of fullscreen and runs things in the background

type GuidesDrawerProps = { guide: Guide; backToAllGuides: () => void }
function GuidesDrawer({
  guide,
  backToAllGuides
}: GuidesDrawerProps): JSX.Element {
  return (
    <WideDrawer id="guide-drawer">
      <DrawerHeader>
        {guide.title !== 'allGuides' && (
          <div onClick={backToAllGuides}> back to all guides</div>
        )}
        {guide.title} Guides{' '}
      </DrawerHeader>
      <DrawerBody>
        <GuideContent>
          <GuideCarousel slides={guide.slides} />
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
