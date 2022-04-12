declare module 'monaco-editor/esm/vs/base/parts/quickinput/browser/quickInputList' {
  export class QuickInputList {
    layout: (maxHeight: number) => void
    list: {
      getHTMLElement: () => HTMLElement
      layout: () => void
    }
  }
}
