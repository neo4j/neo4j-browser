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
import { Action, Dispatch } from 'redux'
import { connect } from 'react-redux'

import {
  Guide,
  GotoSlideAction,
  SetGuideAction,
  FetchGuideAction,
  UpdateGuideAction,
  getCurrentGuide,
  gotoSlide,
  getRemoteGuides,
  resetGuide,
  setCurrentGuide,
  fetchRemoteGuide,
  updateRemoteGuides
} from 'shared/modules/guides/guidesDuck'
import { GlobalState } from 'shared/globalState'
import GuideCarousel from '../GuideCarousel/GuideCarousel'
import { BackIcon } from '../../components/icons/Icons'
import {
  StyledGuideDrawer,
  GuideTitle,
  BackIconContainer,
  StyledGuideDrawerHeader,
  StyledDrawerSeparator
} from './styled'
import GuidePicker from './GuidePicker'

type GuideDrawerProps = {
  currentGuide: Guide | null
  remoteGuides: Guide[]
  backToAllGuides: () => void
  gotoSlide: (slideIndex: number) => GotoSlideAction
  setCurrentGuide: (guide: Guide) => SetGuideAction
  fetchRemoteGuide: (identifier: string) => FetchGuideAction
  updateRemoteGuides: (newList: Guide[]) => UpdateGuideAction
}

function GuideDrawer({
  currentGuide,
  remoteGuides,
  backToAllGuides,
  gotoSlide,
  setCurrentGuide,
  fetchRemoteGuide,
  updateRemoteGuides
}: GuideDrawerProps): JSX.Element {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <StyledGuideDrawer
      id="guide-drawer"
      data-testid="guideDrawer"
      ref={scrollRef}
    >
      <StyledGuideDrawerHeader onClick={backToAllGuides}>
        {currentGuide !== null && (
          <BackIconContainer data-testid="guidesBackButton">
            <BackIcon width={16} />
          </BackIconContainer>
        )}
        Neo4j Browser Guides{' '}
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
        <>
          <GuideTitle title={currentGuide.title}>
            {currentGuide.title}
          </GuideTitle>
          <GuideCarousel
            slides={currentGuide.slides ?? []}
            currentSlideIndex={currentGuide.currentSlide}
            gotoSlide={gotoSlide}
            scrollToTop={() =>
              scrollRef.current?.scrollIntoView({ block: 'start' })
            }
          />
        </>
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
  updateRemoteGuides: (updatedList: Guide[]) =>
    dispatch(updateRemoteGuides(updatedList))
})
const ConnectedGuideDrawer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GuideDrawer)

export default ConnectedGuideDrawer
