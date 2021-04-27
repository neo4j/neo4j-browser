export default function getRowNumber(
  rowIndex: number,
  pageIndex: number,
  pageSize: number
) {
  return rowIndex + (pageIndex * pageSize + 1)
}
