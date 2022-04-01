import { HeroIcon, CustomIcon } from '@neo4j-ndl/react'
import React from 'react'

const SMALL_SIZE = 15
const LARGE_SIZE = 20

export type IconSize = 'large' | 'small'
export type IconBaseProps = { size?: IconSize }

const getSize = (size?: IconSize) =>
  size && size === 'large' ? LARGE_SIZE : SMALL_SIZE

export const ChevronRightIcon = (): JSX.Element => (
  <HeroIcon iconName="ChevronRightIcon" type="solid" />
)

export const ChevronLeftIcon = (): JSX.Element => (
  <HeroIcon iconName="ChevronLeftIcon" type="solid" />
)

type WidthProps = { width?: number }
export const CopyIcon = ({ width = SMALL_SIZE }: WidthProps): JSX.Element => (
  <HeroIcon
    iconName="DocumentDuplicateIcon"
    type="outline"
    width={width}
    height={width}
  />
)

export const InfoIcon = ({ size }: IconBaseProps): JSX.Element => {
  return (
    <HeroIcon
      iconName="InformationCircleIcon"
      type="solid"
      width={getSize(size)}
      height={getSize(size)}
    />
  )
}

const ZOOM_ICONS_DEFAULT_SIZE_IN_PX = SMALL_SIZE
const ZOOM_ICONS_LARGE_SCALE_FACTOR = 1.2
export const ZoomInIcon = ({
  large = false
}: {
  large?: boolean
}): JSX.Element => {
  const scale = large ? ZOOM_ICONS_LARGE_SCALE_FACTOR : 1
  return (
    <HeroIcon
      iconName="ZoomInIcon"
      width={scale * ZOOM_ICONS_DEFAULT_SIZE_IN_PX}
      height={scale * ZOOM_ICONS_DEFAULT_SIZE_IN_PX}
    />
  )
}
export const ZoomOutIcon = ({
  large = false
}: {
  large?: boolean
}): JSX.Element => {
  const scale = large ? ZOOM_ICONS_LARGE_SCALE_FACTOR : 1
  return (
    <HeroIcon
      iconName="ZoomOutIcon"
      width={scale * ZOOM_ICONS_DEFAULT_SIZE_IN_PX}
      height={scale * ZOOM_ICONS_DEFAULT_SIZE_IN_PX}
    />
  )
}

export const ZoomToFitIcon = ({
  large = false
}: {
  large?: boolean
}): JSX.Element => {
  const scale = large ? ZOOM_ICONS_LARGE_SCALE_FACTOR : 1
  return (
    <CustomIcon
      iconName="FitToScreen"
      width={scale * ZOOM_ICONS_DEFAULT_SIZE_IN_PX}
      height={scale * ZOOM_ICONS_DEFAULT_SIZE_IN_PX}
    />
  )
}

export const WarningIcon = ({ size }: IconBaseProps): JSX.Element => (
  <HeroIcon
    iconName="ExclamationIcon"
    type="solid"
    width={getSize(size)}
    height={getSize(size)}
  />
)
