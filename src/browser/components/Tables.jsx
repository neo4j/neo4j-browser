export const SysInfoTable = ({header, children}) => {
  return (
    <table>
      <thead>
        <tr>
          <th>{header}</th>
        </tr>
      </thead>
      <tbody>
        {children}
      </tbody>
    </table>
  )
}

export const SysInfoTableEntry = ({label, value}) => {
  return (
    <tr>
      <td>{label}</td>
      <td>{value}</td>
    </tr>
  )
}
