export interface IScript {
  id?: string // static scripts have no id
  name?: string
  contents: string
  path: string
  isSuggestion?: boolean // dummy prop for static scripts
}

export type AnyFunc = Function | ((...args: any[]) => any)

export type ScriptFolder = [string, IScript[]]

export type NewFolderPathGenerator = (
  namespace: string,
  allFolderPaths: string[]
) => string
