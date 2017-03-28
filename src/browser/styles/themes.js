export const base = {
  // Text colors
  primaryText: '#333',
  secondaryText: '#333',
  headerText: '#333',
  asideText: '#666',
  link: '#428BCA',
  linkHover: '#5dade2',

  // Backgrounds
  primaryBackground: '#eee',
  secondaryBackground: '#fff',
  editorBarBackground: '#EFEFF4',
  drawerBackground: '#292b31',

  // Fonts
  primaryFontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  drawerHeaderFontFamily: "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  streamlineFontFamily: 'streamline',
  // Headers
  primaryHeaderText: '#fff',

  // User feedback colors
  success: '#70E9B1',
  error: '#E74C3C',
  warning: '#ebf094',

  // Buttons
  primaryButtonText: '',
  primaryButtonBackground: '',
  secondaryButtonText: '#717172',
  secondaryButtonBorder: '1px solid #717172',
  secondaryButtonBackground: 'transparent',
  secondaryButtonTextHover: '#40454F',
  secondaryButtonBorderHover: '1px solid #717172',
  secondaryButtonBackgroundHover: '#717172',
  formButtonBorder: '1px solid #ccc',
  formButtonBorderHover: '1px solid ##adadad',
  formButtonBackgroundHover: '#e6e6e6',

  // Frame
  frameBorder: 'none',
  inFrameBorder: '1px solid #e6e9ef',
  frameSidebarBackground: '#F8F9FB',
  frameTitlebarText: '#717172'
}

export const normal = {
  ...base
}

export const outline = {
  ...base,
  primaryText: '#000',
  secondaryText: '#000',
  frameBorder: '1px solid #000',
  inFrameBorder: '1px solid #000'
}
