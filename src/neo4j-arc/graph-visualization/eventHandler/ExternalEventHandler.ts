import { ExpandNodeHandler, VItem } from '../types'
class ExternalEventHandler {
  onItemMouseOver: (item: VItem) => void
  onExpandNode: ExpandNodeHandler

  constructor(
    onItemMouseOver: (item: VItem) => void,
    onExpandNode: ExpandNodeHandler
  ) {
    this.onItemMouseOver = onItemMouseOver
    this.onExpandNode = onExpandNode
  }
}

export default ExternalEventHandler
