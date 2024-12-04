interface Document {
  startViewTransition?: (callback: () => void) => {
    finished: Promise<void>
    ready: Promise<void>
    updateCallbackDone: Promise<void>
  }
} 