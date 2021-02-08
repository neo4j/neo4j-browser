import React, { ReactEventHandler } from 'react'
import { Icon, SemanticICONS } from 'semantic-ui-react'
import { SemanticCOLORS } from 'semantic-ui-react/dist/commonjs/generic'
import { StyledSavedScriptsButton } from './styled'
import SVGInline from 'react-svg-inline'

import newFolderIcon from 'icons/folder-add.svg'
import hollow_run_icon from 'icons/hollow-run-icon.svg'

type SavedScriptsButtonProps = {
  onClick: ReactEventHandler
  title: string
  iconName: SemanticICONS
  color?: SemanticCOLORS
}

export default function SavedScriptsButton({
  onClick,
  title,
  iconName,
  color
}: SavedScriptsButtonProps): JSX.Element {
  return (
    <StyledSavedScriptsButton
      title={title}
      data-testid={`savedScriptsButton-${title}`}
      onClick={onClick}
    >
      <Icon color={color} name={iconName} />
    </StyledSavedScriptsButton>
  )
}

type OnClickProp = { onClick: ReactEventHandler }
const ExportButton = ({ onClick }: OnClickProp): JSX.Element =>
  SavedScriptsButton({ onClick, title: 'Export', iconName: 'download' })

const EditButton = ({ onClick }: OnClickProp): JSX.Element =>
  SavedScriptsButton({ onClick, title: 'Edit', iconName: 'pencil' })

const RunButton = ({ onClick }: OnClickProp): JSX.Element => (
  <StyledSavedScriptsButton
    title="Run"
    data-testid={'savedScriptsButton-Run'}
    onClick={onClick}
  >
    <SVGInline
      cleanup={['title']}
      svg={hollow_run_icon}
      accessibilityLabel={'Run'}
      width="15px"
      className="centeredSvgIcon"
    />
  </StyledSavedScriptsButton>
)
const NewFolderButton = ({ onClick }: OnClickProp): JSX.Element => (
  <StyledSavedScriptsButton
    title="New folder"
    data-testid={'savedScriptsButton-New folder'}
    onClick={onClick}
  >
    <SVGInline
      cleanup={['title']}
      svg={newFolderIcon}
      accessibilityLabel={'New folder'}
      width="15px"
      className="centeredSvgIcon"
    />
  </StyledSavedScriptsButton>
)

const RemoveButton = ({ onClick }: OnClickProp): JSX.Element =>
  SavedScriptsButton({
    onClick,
    title: 'Remove',
    iconName: 'trash alternate outline'
  })

const RedRemoveButton = ({ onClick }: OnClickProp): JSX.Element =>
  SavedScriptsButton({
    onClick,
    title: 'Remove',
    iconName: 'trash alternate outline',
    color: 'red'
  })

export {
  SavedScriptsButton,
  ExportButton,
  EditButton,
  RunButton,
  NewFolderButton,
  RemoveButton,
  RedRemoveButton
}
