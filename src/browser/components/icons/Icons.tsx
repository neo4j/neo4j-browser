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
import { Icon } from 'semantic-ui-react'
import { keyframes, css } from 'styled-components'
import { IconContainer } from './IconContainer'
import addCircle from 'icons/add-circle.svg'
import appWindowCode from 'icons/app-window-code.svg'
import arrowLeft from 'icons/arrow-left.svg'
import arrowRight from 'icons/arrow-right.svg'
import backArrow from 'icons/back-arrow.svg'
import buttonRefreshArrow from 'icons/button-refresh-arrow.svg'
import cannyFeedback from 'icons/canny-feedback.svg'
import cannyNotifications from 'icons/canny-notifications.svg'
import close from 'icons/close.svg'
import cloudCheck from 'icons/cloud-check.svg'
import cloudRemove from 'icons/cloud-remove.svg'
import cog from 'icons/cog.svg'
import databaseCheck from 'icons/database-check.svg'
import downloadBottom from 'icons/download-bottom.svg'
import expand from 'icons/expand.svg'
import file from 'icons/file.svg'
import folderEmpty from 'icons/folder-empty.svg'
import help from 'icons/help.svg'
import monitorPlay from 'icons/monitor-play.svg'
import navigationMenuVertical from 'icons/navigation-menu-vertical.svg'
import neo4j from 'icons/neo4j-icon.svg'
import newFolder from 'icons/folder-add.svg'
import pin from 'icons/pin.svg'
import ratingStar from 'icons/rating-star.svg'
import runIcon from 'icons/run-icon.svg'
import saveFavorite from 'icons/save-favorite.svg'
import shrink from 'icons/shrink.svg'
import skipPrev from 'icons/skip-prev.svg'
import stopIcon from 'icons/stop-icon.svg'
import table from 'icons/table.svg'
import text from 'icons/text.svg'

const inactive = `
  color: #797979;
  fill: #797979;
`
const green = `
  color: #4cd950;
`

const successGreen = `
  color: #4cd950;
`
const blue = `
  color: #58c8e3;
`
const alertYellow = `
  color: #ffaf00;
`
const warningRed = `
  color: #df4d3b;
`
const white = `
  color: #ffffff;
`
const lightBlue = `
  color: #5dade2;
`

const neo4jPulse = keyframes`
  0%,
  100% {
    fill: #FFF;
  }
  50% {
    fill: #018bff;
  }
`
const SMALL_SIZE = 12
const LARGE_SIZE = 20
const SIDEBAR_SIZE = 28

const credits = css`
  animation: ${neo4jPulse} 2s infinite;
  animation-timing-function: ease-in-out;
`

const databaseConnectionStateStyles: {
  [key: string]: { active: string; inactive: string; classModifier: string }
} = {
  connected: {
    active: green,
    inactive: inactive,
    classModifier: 'check'
  },
  disconnected: {
    active: warningRed,
    inactive: inactive,
    classModifier: 'delete'
  },
  pending: {
    active: alertYellow,
    inactive: inactive,
    classModifier: 'alert'
  }
}

export const DatabaseIcon = (props: {
  isOpen: boolean
  connectionState: string
  title: string
}): JSX.Element => {
  const { connectionState, ...rest } = props
  return (
    <IconContainer
      activeStyle={databaseConnectionStateStyles[connectionState].active}
      inactiveStyle={databaseConnectionStateStyles[connectionState].inactive}
      className={databaseConnectionStateStyles[connectionState].classModifier}
      icon={databaseCheck}
      width={SIDEBAR_SIZE}
      {...rest}
    />
  )
}

export const GuidesDrawerIcon = (props: { isOpen: boolean }): JSX.Element => (
  <IconContainer
    activeStyle={white}
    inactiveStyle={inactive}
    width={28}
    isOpen={props.isOpen}
    icon={monitorPlay}
    title="Guides"
  />
)

interface SidebarIconProps {
  isOpen: boolean
  title: string
}

export const FavoritesIcon = ({
  isOpen,
  title
}: SidebarIconProps): JSX.Element => (
  <IconContainer
    activeStyle={white}
    inactiveStyle={inactive}
    icon={ratingStar}
    width={SIDEBAR_SIZE}
    isOpen={isOpen}
    title={title}
  />
)
export const ProjectFilesIcon = ({
  isOpen,
  title
}: SidebarIconProps): JSX.Element => (
  <IconContainer
    activeStyle={white}
    inactiveStyle={inactive}
    icon={file}
    width={SIDEBAR_SIZE}
    isOpen={isOpen}
    title={title}
  />
)

export const DocumentsIcon = ({
  isOpen,
  title
}: SidebarIconProps): JSX.Element => (
  <IconContainer
    activeStyle={white}
    inactiveStyle={inactive}
    icon={help}
    width={SIDEBAR_SIZE}
    isOpen={isOpen}
    title={title}
  />
)

export const CloudSyncIcon = ({
  isOpen,
  title,
  connected
}: SidebarIconProps & { connected: boolean }): JSX.Element => {
  return (
    <IconContainer
      activeStyle={connected ? successGreen : warningRed}
      inactiveStyle={connected ? inactive : warningRed}
      icon={connected ? cloudCheck : cloudRemove}
      width={SIDEBAR_SIZE}
      isOpen={isOpen}
      title={title}
    />
  )
}

export const SettingsIcon = ({
  isOpen,
  title
}: SidebarIconProps): JSX.Element => (
  <IconContainer
    activeStyle={white}
    inactiveStyle={inactive}
    icon={cog}
    width={SIDEBAR_SIZE}
    isOpen={isOpen}
    title={title}
  />
)
export const AboutIcon = ({ isOpen, title }: SidebarIconProps): JSX.Element => (
  <IconContainer
    activeStyle={credits}
    inactiveStyle={inactive}
    icon={neo4j}
    width={SIDEBAR_SIZE}
    isOpen={isOpen}
    title={title}
  />
)

export const SlidePreviousIcon = (): JSX.Element => (
  <IconContainer icon={arrowLeft} width={LARGE_SIZE} />
)
export const SlideNextIcon = (): JSX.Element => (
  <IconContainer icon={arrowRight} width={LARGE_SIZE} />
)
export const StackPreviousIcon = (): JSX.Element => (
  <IconContainer icon={skipPrev} width={SMALL_SIZE} />
)
export const StackNextIcon = (): JSX.Element => (
  <IconContainer
    icon={skipPrev}
    style={{ transform: 'rotate(180deg)' }}
    width={SMALL_SIZE}
  />
)
export const TableIcon = (): JSX.Element => (
  <IconContainer icon={table} text="Table" width={LARGE_SIZE} />
)
export const VisualizationIcon = (): JSX.Element => (
  <IconContainer icon={neo4j} text="Graph" width={LARGE_SIZE} />
)
export const AsciiIcon = (): JSX.Element => (
  <IconContainer icon={text} text="Text" width={18} />
)
export const CodeIcon = (): JSX.Element => (
  <IconContainer icon={appWindowCode} text="Code" width={LARGE_SIZE} />
)
export const PlanIcon = (): JSX.Element => (
  <IconContainer className="sl-hierarchy" text="Plan" />
)
export const AlertIcon = (): JSX.Element => (
  <IconContainer className="sl-alert" text="Warn" />
)
export const ErrorIcon = (): JSX.Element => (
  <IconContainer className="fa fa-file-text-o" text="Error" />
)

export const ZoomInIcon = ({
  regulateSize
}: {
  regulateSize: 1 | 2
}): JSX.Element => (
  <IconContainer
    activeStyle={inactive}
    inactiveStyle={inactive}
    regulateSize={regulateSize}
    className="sl-zoom-in"
  />
)
export const ZoomOutIcon = ({
  regulateSize
}: {
  regulateSize: 1 | 2
}): JSX.Element => (
  <IconContainer
    activeStyle={inactive}
    inactiveStyle={inactive}
    regulateSize={regulateSize}
    className="sl-zoom-out"
  />
)

export const BinIcon = (): JSX.Element => (
  <IconContainer
    activeStyle="white"
    inactiveStyle="white"
    suppressIconStyles="true"
    className="sl-bin"
  />
)

export const RefreshIcon = (): JSX.Element => (
  <IconContainer icon={buttonRefreshArrow} width={SMALL_SIZE} />
)
export const RunIcon = (): JSX.Element => (
  <IconContainer icon={runIcon} width={SMALL_SIZE} />
)
export const StopIcon = (): JSX.Element => (
  <IconContainer icon={stopIcon} width={SMALL_SIZE} />
)

type WidthProps = { width?: number }
export const CloseIcon = ({ width = SMALL_SIZE }: WidthProps): JSX.Element => (
  <IconContainer icon={close} width={width} />
)
export const UpIcon = ({ width = SMALL_SIZE }: WidthProps): JSX.Element => (
  <IconContainer fontSize={width} className="sl-chevron-up" />
)
export const DownIcon = ({ width = SMALL_SIZE }: WidthProps): JSX.Element => (
  <IconContainer fontSize={width} className="sl-chevron-down" />
)
export const PinIcon = ({ width = SMALL_SIZE }: WidthProps): JSX.Element => (
  <IconContainer icon={pin} width={width} />
)
export const ExpandIcon = ({ width = SMALL_SIZE }: WidthProps): JSX.Element => (
  <IconContainer icon={expand} width={width} />
)
export const ContractIcon = ({
  width = SMALL_SIZE
}: WidthProps): JSX.Element => <IconContainer icon={shrink} width={width} />

export const DoubleUpIcon = (): JSX.Element => (
  <IconContainer className="sl-double-up" />
)
export const DoubleDownIcon = (): JSX.Element => (
  <IconContainer className="sl-double-down" />
)
export const SaveFavoriteIcon = (): JSX.Element => (
  <IconContainer icon={saveFavorite} width={SMALL_SIZE} />
)

export const MinusIcon = (): JSX.Element => (
  <IconContainer
    activeStyle={blue}
    inactiveStyle={inactive}
    className="sl-minus-circle"
  />
)

export const RightArrowIcon = (): JSX.Element => (
  <IconContainer
    activeStyle={blue}
    inactiveStyle={inactive}
    className="sl-arrow-circle-right"
  />
)
export const CancelIcon = (): JSX.Element => (
  <IconContainer
    activeStyle={blue}
    inactiveStyle={inactive}
    className="sl-delete-circle"
  />
)
export const DownloadIcon = (): JSX.Element => (
  <IconContainer icon={downloadBottom} width={SMALL_SIZE} />
)
export const ExpandMenuIcon = (): JSX.Element => (
  <IconContainer activeStyle={blue} className="fa fa-caret-left" />
)
export const CollapseMenuIcon = (): JSX.Element => (
  <IconContainer activeStyle={blue} className="fa fa-caret-down" />
)
export const PlayIcon = (): JSX.Element => (
  <IconContainer
    activeStyle={lightBlue}
    inactiveStyle={blue}
    className="fa fa-play-circle-o"
  />
)

export const PlainPlayIcon = (): JSX.Element => (
  <IconContainer className="fa fa-play-circle" />
)
export const QuestionIcon = ({ title }: { title: string }): JSX.Element => (
  <IconContainer
    activeStyle={lightBlue}
    inactiveStyle={blue}
    title={title}
    className="fa fa-question-circle-o"
  />
)

export const PlusIcon = (): JSX.Element => (
  <IconContainer
    activeStyle={white}
    inactiveStyle={white}
    className="fa fa-plus"
  />
)
export const EditIcon = (): JSX.Element => (
  <IconContainer
    activeStyle={white}
    inactiveStyle={white}
    className="sl-pencil"
  />
)
export const SpinnerIcon = (): JSX.Element => (
  <IconContainer
    data-testid="spinner"
    className="fa fa-spinner fa-spin fa-2x"
  />
)
export const SmallSpinnerIcon = (): JSX.Element => (
  <IconContainer className="fa fa-spinner fa-spin " />
)
export const SquareIcon = (): JSX.Element => (
  <IconContainer className="fa fa-square-o" />
)
export const CheckedSquareIcon = (): JSX.Element => (
  <IconContainer className="fa fa-check-square-o" />
)

export const ExclamationTriangleIcon = (): JSX.Element => (
  <IconContainer suppressIconStyles className="fa fa-exclamation-triangle" />
)

export const FireExtinguisherIcon = ({
  title = 'Reset'
}: {
  title: string
}): JSX.Element => (
  <IconContainer className="fa fa-fire-extinguisher" title={title} />
)

export const NewFolderIcon = (): JSX.Element => (
  <IconContainer icon={newFolder} width={SMALL_SIZE} />
)
export const NavIcon = (): JSX.Element => (
  <IconContainer icon={navigationMenuVertical} width={SMALL_SIZE} />
)
export const AddIcon = (): JSX.Element => (
  <IconContainer icon={addCircle} width={SMALL_SIZE} />
)
export const FolderIcon = (): JSX.Element => (
  <IconContainer icon={folderEmpty} width={SMALL_SIZE} />
)
export const SavedScriptsPlayIcon = (): JSX.Element => (
  <IconContainer icon={runIcon} width={SMALL_SIZE} />
)

export const SavedScriptsExpandMenuRightIcon = (): JSX.Element => (
  <Icon name="caret right" />
)

export const SavedScriptsCollapseMenuIcon = (): JSX.Element => (
  <Icon name="caret down" />
)

export const CannyFeedbackIcon = (): JSX.Element => (
  <IconContainer icon={cannyFeedback} />
)

export const CannyNotificationsIcon = (): JSX.Element => (
  <IconContainer icon={cannyNotifications} />
)

export const BackIcon = ({ width }: { width: number }): JSX.Element => (
  <IconContainer width={width} icon={backArrow} />
)
