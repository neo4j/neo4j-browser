const userHasNotOptedOutOfPreview = (): boolean => {
  const prefersOldBrowser = localStorage.getItem('prefersOldBrowser')
  const doesPreferQuery = prefersOldBrowser === 'false'
  return doesPreferQuery || prefersOldBrowser === null
}

export const optedInByUtcOffset = (): boolean => {
  const utcOffset = new Date().getTimezoneOffset()
  // UTC offset of -120 minutes (2 hours) e.g. CEST to 0 minutes (0 hours)
  const utcOffsetIsOptedIn = utcOffset >= -120 && utcOffset <= 0
  return utcOffsetIsOptedIn && userHasNotOptedOutOfPreview()
}
