import { ExpandNodeHandler, VItem } from '../types'
import { GraphStats } from '../utils/mapper'
class ExternalEventHandler {
  onItemSelect: (item: VItem) => void
  onItemMouseOver: (item: VItem) => void
  onExpandNode: ExpandNodeHandler

  constructor(
    onItemSelect: (item: VItem) => void,
    onItemMouseOver: (item: VItem) => void,
    onExpandNode: ExpandNodeHandler
  ) {
    this.onItemSelect = onItemSelect
    this.onItemMouseOver = onItemMouseOver
    this.onExpandNode = onExpandNode
  }
}

export default ExternalEventHandler
