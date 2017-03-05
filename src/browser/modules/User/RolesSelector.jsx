import React from 'react'

const RolesSelector = ({roles = [], onChange = null, selectedValue = undefined}) => {
  if (roles.length > 0) {
    const options = roles.map((role, i) => {
      return (<option key={i} value={role}>{role}</option>)
    })
    return (
      <select
        className='roles-selector'
        placeholder='Select role'
        value={selectedValue}
        onChange={onChange}
      >
        {options}
      </select>
    )
  } else { return null }
}
export default RolesSelector
