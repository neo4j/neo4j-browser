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
import { Button, Modal } from 'semantic-ui-react'

interface ConfirmationDialogProps {
  cancelLabel?: string
  confirmLabel?: string
  onClose: () => void
  onConfirm: () => void
  open: boolean
}

function ConfirmationDialog({
  cancelLabel = 'Cancel',
  children,
  confirmLabel = 'OK',
  onClose,
  onConfirm,
  open
}: React.PropsWithChildren<ConfirmationDialogProps>): JSX.Element {
  return (
    <Modal
      closeOnEscape={true}
      onClose={() => onClose()}
      open={open}
      size="tiny"
      style={{ fontSize: '16px', lineHeight: '1.5' }}
    >
      <Modal.Content>{children}</Modal.Content>
      <Modal.Actions style={{ background: 'white', border: 'none' }}>
        <Button basic color="grey" onClick={() => onClose()}>
          {cancelLabel}
        </Button>
        <Button
          color="twitter"
          content={confirmLabel}
          onClick={() => onConfirm()}
        />
      </Modal.Actions>
    </Modal>
  )
}

export default ConfirmationDialog
