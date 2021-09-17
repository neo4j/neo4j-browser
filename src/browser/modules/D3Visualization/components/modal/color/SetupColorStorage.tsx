import * as React from 'react'
export interface ISetupColorStorageProps {
  properties: {
    [key: string]: Set<string>
  }
  updateStyle: () => void
}
const SetupColorStorage: React.FC = () => <div>hello</div>

export default SetupColorStorage
