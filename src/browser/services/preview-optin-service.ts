const notOptedOutOfPreview = (): boolean => {
  const prefersOldBrowser = localStorage.getItem('prefersOldBrowser')
  const doesPreferQuery = prefersOldBrowser === 'false'

  return doesPreferQuery || prefersOldBrowser === null
}

export const optedInByLocalhost = (): boolean => {
  return notOptedOutOfPreview() && window.location.hostname === 'localhost'
}
