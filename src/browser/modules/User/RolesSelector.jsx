import React from 'react'
import Select from 'grommet/components/Select'

const RolesSelector = ({roles = [], onChange = null, selectedValue = undefined}) => {
  if (roles.length > 0) {
    return (
      <Select
        className='roles-selector'
        placeHolder='Select role'
        options={roles}
        value={selectedValue}
        onChange={onChange}
      />
    )
  } else { return null }
}
export default RolesSelector
