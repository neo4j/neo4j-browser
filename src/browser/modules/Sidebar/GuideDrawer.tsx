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
import { Action, Dispatch } from 'redux'

import { BackIcon } from 'browser-components/icons/LegacyIcons'

import GuideCarousel from '../GuideCarousel/GuideCarousel'
import GuidePicker from './GuidePicker'
import {
  BackIconContainer,
  GuideTitle,
  StyledDrawerSeparator,
  StyledGuideDrawer,
  StyledGuideDrawerHeader
} from './styled'
import { Guide } from 'browser/documentation'
import { GlobalState } from 'shared/globalState'
import {
  RemoteGuide,
  fetchRemoteGuide,
  getCurrentGuide,
  getRemoteGuides,
  gotoSlide,
  resetGuide,
  setCurrentGuide,
  updateRemoteGuides
} from 'shared/modules/guides/guidesDuck'

export type GuideDrawerProps = {
  currentGuide: Guide | null
  remoteGuides: RemoteGuide[]
  backToAllGuides: () => void
  gotoSlide: (slideIndex: number) => void
  setCurrentGuide: (guide: Guide) => void
  fetchRemoteGuide: (identifier: string) => void
  updateRemoteGuides: (newList: RemoteGuide[]) => void
}

export const GuideDrawer = ({
  currentGuide,
  remoteGuides,
  backToAllGuides,
  gotoSlide,
  setCurrentGuide,
  fetchRemoteGuide,
  updateRemoteGuides
}: GuideDrawerProps): JSX.Element => {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <StyledGuideDrawer
      id="guide-drawer"
      data-testid="guidesDrawer"
      ref={scrollRef}
    >
      <StyledGuideDrawerHeader>
        {currentGuide !== null ? (
          <>
            <BackIconContainer
              data-testid="guidesBackButton"
              onClick={backToAllGuides}
            >
              <BackIcon width={16} />
            </BackIconContainer>
            {currentGuide.title}
          </>
        ) : (
          'Neo4j Browser Guides '
        )}
      </StyledGuideDrawerHeader>
      <StyledDrawerSeparator />
      {currentGuide === null ? (
        <GuidePicker
          remoteGuides={remoteGuides}
          setCurrentGuide={setCurrentGuide}
          fetchRemoteGuide={fetchRemoteGuide}
          updateRemoteGuides={updateRemoteGuides}
        />
      ) : (
        <GuideCarousel
          slides={currentGuide.slides}
          currentSlideIndex={currentGuide.currentSlide}
          gotoSlide={gotoSlide}
          scrollToTop={() =>
            scrollRef.current?.scrollIntoView({ block: 'start' })
          }
        />
      )}
    </StyledGuideDrawer>
  )
}

const mapStateToProps = (state: GlobalState) => ({
  currentGuide: getCurrentGuide(state),
  remoteGuides: getRemoteGuides(state)
})
const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  backToAllGuides: () => dispatch(resetGuide()),
  gotoSlide: (slideIndex: number) => dispatch(gotoSlide(slideIndex)),
  setCurrentGuide: (guide: Guide) => dispatch(setCurrentGuide(guide)),
  fetchRemoteGuide: (identifier: string) =>
    dispatch(fetchRemoteGuide(identifier)),
  updateRemoteGuides: (updatedList: RemoteGuide[]) =>
    dispatch(updateRemoteGuides(updatedList))
})
const ConnectedGuideDrawer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GuideDrawer)

export default ConnectedGuideDrawer
