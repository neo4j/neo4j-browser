/** @jsxImportSource react */
import { every } from 'lodash-es'

export default function RowActions({
  rows,
  onExpandClick,
  onSelectClick
}: any) {
  return (
    <span className="flex items-center gap-2">
      {onExpandClick && (
        <button 
          className="p-1 hover:bg-secondary rounded" 
          onClick={onExpandClick}
        >
          {every(rows, 'isExpanded') ? '▼' : '▶'}
        </button>
      )}
      {onSelectClick && (
        <input
          type="checkbox"
          className="w-4 h-4"
          checked={every(rows, 'isSelected')}
          onChange={(e) => onSelectClick(e.target.checked)}
        />
      )}
    </span>
  )
}
