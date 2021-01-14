export interface Script {
  id?: string // static scripts have no id
  name?: string
  contents: string
  path: string
  isSuggestion?: boolean // dummy prop for static scripts
}

export type ScriptFolder = [string, Script[]]

export type NewFolderPathGenerator = (
  namespace: string,
  allFolderPaths: string[]
) => string

export type FolderUpdate = {
  name?: string
  path?: string
  isFolderName?: boolean
  isNewFolder?: boolean
}
