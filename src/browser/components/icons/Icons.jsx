/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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
import styles from './style.css'
import { IconContainer } from './IconContainer'
import ratingStar from './svg/rating-star.svg'
import databaseCheck from './svg/database-check.svg'
import bookSearch from './svg/book-search.svg'
import cog from './svg/cog.svg'
import cloudCheck from './svg/cloud-check.svg'
import cloudRemove from './svg/cloud-remove.svg'

const databaseConnectionStateStyles = {
  connected: {
    active: styles.green,
    inactive: styles.inactive,
    classModifier: 'check'
  },
  disconnected: {
    active: styles.warningRed,
    inactive: styles.inactive,
    classModifier: 'delete'
  },
  pending: {
    active: styles.alertYellow,
    inactive: styles.inactive,
    classModifier: 'alert'
  }
}

export const DatabaseIcon = ({ isOpen, connectionState }) => (
  <IconContainer
    isOpen={isOpen}
    activeStyle={databaseConnectionStateStyles[connectionState].active}
    inactiveStyle={databaseConnectionStateStyles[connectionState].inactive}
    className={databaseConnectionStateStyles[connectionState].classModifier}
    icon={databaseCheck}
    width={28}
  />
)
export const FavoritesIcon = ({ isOpen }) => (
  <IconContainer
    isOpen={isOpen}
    activeStyle={styles.white}
    inactiveStyle={styles.inactive}
    icon={ratingStar}
    width={28}
  />
)
export const DocumentsIcon = ({ isOpen }) => (
  <IconContainer
    isOpen={isOpen}
    activeStyle={styles.white}
    inactiveStyle={styles.inactive}
    icon={bookSearch}
    width={28}
  />
)

export const CloudIcon = ({ isOpen }) => (
  <IconContainer
    isOpen={isOpen}
    activeStyle={styles.successGreen}
    inactiveStyle={styles.inactive}
    icon={cloudCheck}
    width={28}
  />
)
export const CloudDisconnectedIcon = ({ isOpen }) => (
  <IconContainer
    isOpen={isOpen}
    activeStyle={styles.warningRed}
    inactiveStyle={styles.warningRed}
    icon={cloudRemove}
    width={28}
  />
)
export const CloudSyncIcon = ({ isOpen, connected }) => (
  <IconContainer
    isOpen={isOpen}
    activeStyle={connected ? styles.successGreen : styles.warningRed}
    inactiveStyle={connected ? styles.inactive : styles.warningRed}
    icon={connected ? cloudCheck : cloudRemove}
    width={28}
  />
)

export const SettingsIcon = ({ isOpen }) => (
  <IconContainer
    isOpen={isOpen}
    activeStyle={styles.white}
    inactiveStyle={styles.inactive}
    icon={cog}
    width={28}
  />
)
export const AboutIcon = ({ isOpen }) => (
  <IconContainer
    isOpen={isOpen}
    activeStyle={styles.credits}
    inactiveStyle={styles.inactive}
    className='nw nw-neo4j-outline-32px'
  />
)

export const TableIcon = () => (
  <IconContainer className='fa fa-table' text='Table' />
)
export const VisualizationIcon = () => (
  <IconContainer className='nw nw-neo4j-outline-16px' text='Graph' />
)
export const AsciiIcon = () => (
  <IconContainer className='fa fa-font' text='Text' />
)
export const CodeIcon = () => (
  <IconContainer className='fa fa-code' text='Code' />
)
export const PlanIcon = () => (
  <IconContainer className='sl-hierarchy' text='Plan' />
)
export const AlertIcon = () => (
  <IconContainer className='sl-alert' text='Warn' />
)
export const ErrorIcon = () => (
  <IconContainer className='fa fa-file-text-o' text='Error' />
)

export const ZoomInIcon = () => (
  <IconContainer
    activeStyle={styles.active}
    inactiveStyle={styles.inactive}
    className='sl-zoom-in'
  />
)
export const ZoomOutIcon = () => (
  <IconContainer
    activeStyle={styles.active}
    inactiveStyle={styles.inactive}
    className='sl-zoom-out'
  />
)

export const BinIcon = props => (
  <IconContainer
    activeStyle={props.deleteAction ? styles.warningRed : styles.white}
    inactiveStyle={props.deleteAction ? styles.warningRed : styles.white}
    {...props}
    className='sl-bin'
  />
)

export const ExpandIcon = () => <IconContainer className='sl-scale-spread' />
export const ContractIcon = () => <IconContainer className='sl-scale-reduce' />
export const RefreshIcon = () => <IconContainer className='sl-loop' />
export const CloseIcon = () => (
  <IconContainer className='sl-delete' regulateSize='0.85' />
)
export const UpIcon = () => <IconContainer className='sl-chevron-up' />
export const DownIcon = () => <IconContainer className='sl-chevron-down' />
export const DoubleUpIcon = () => <IconContainer className='sl-double-up' />
export const DoubleDownIcon = () => <IconContainer className='sl-double-down' />
export const PinIcon = () => <IconContainer className='sl-pin' />
export const MinusIcon = () => (
  <IconContainer
    activeStyle={styles.blue}
    inactiveStyle={styles.inactive}
    className='sl-minus-circle'
  />
)
export const RightArrowIcon = () => (
  <IconContainer
    activeStyle={styles.blue}
    inactiveStyle={styles.inactive}
    className='sl-arrow-circle-right'
  />
)
export const CancelIcon = () => (
  <IconContainer
    activeStyle={styles.blue}
    inactiveStyle={styles.inactive}
    className='sl-delete-circle'
  />
)
export const DownloadIcon = () => (
  <IconContainer className='sl-download-drive' />
)
export const ExpandMenuIcon = () => (
  <IconContainer activeStyle={styles.blue} className='fa fa-caret-left' />
)
export const CollapseMenuIcon = () => (
  <IconContainer activeStyle={styles.blue} className='fa fa-caret-down' />
)
export const PlayIcon = () => (
  <IconContainer
    activeStyle={styles.lightBlue}
    inactiveStyle={styles.blue}
    className='fa fa-play-circle-o'
  />
)
export const PlainPlayIcon = () => (
  <IconContainer className='fa fa-play-circle' />
)
export const QuestionIcon = props => (
  <IconContainer
    activeStyle={styles.lightBlue}
    inactiveStyle={styles.blue}
    {...props}
    className='fa fa-question-circle-o'
  />
)
export const PlusIcon = () => (
  <IconContainer
    activeStyle={styles.white}
    inactiveStyle={styles.white}
    className='fa fa-plus'
  />
)
export const EditIcon = () => (
  <IconContainer
    activeStyle={styles.white}
    inactiveStyle={styles.white}
    className='sl-pencil'
  />
)
export const Spinner = () => (
  <IconContainer className='fa fa-spinner fa-spin fa-2x' />
)
export const SmallSpinner = () => (
  <IconContainer className='fa fa-spinner fa-spin ' />
)
export const SquareIcon = () => <IconContainer className='fa fa-square-o' />
export const CheckedSquareIcon = () => (
  <IconContainer className='fa fa-check-square-o' />
)

export const ExclamationTriangleIcon = () => (
  <IconContainer suppressIconStyles className='fa fa-exclamation-triangle' />
)

export const FireExtinguisherIcon = ({ title = 'Reset' }) => (
  <IconContainer className='fa fa-fire-extinguisher' title={title} />
)
