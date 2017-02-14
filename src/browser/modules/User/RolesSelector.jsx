import React from 'react'
import Select from 'grommet/components/Select'

const RolesSelector = ({roles = [], onChange = null, selectedValue = undefined}) => {
  return (
    <Select
      placeHolder='Select role'
      options={roles}
      value={selectedValue}
      onChange={onChange}
    />
  )
}
export default RolesSelector
