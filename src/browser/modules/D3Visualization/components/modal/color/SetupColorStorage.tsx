import * as React from 'react'
import SetupColorModalBody from './SetupColorModalBody'
export interface ISetupColorStorageProps {
  properties: {
    [key: string]: Set<string>
  }
  updateStyle: () => void
}
const SetupColorStorage: React.FC<ISetupColorStorageProps> = props => {
  return <SetupColorModalBody {...props} />
}

export default SetupColorStorage
