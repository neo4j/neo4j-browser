const EU_LOCALES = [
  'bg-bg', // Bulgarian (Bulgaria)
  'cs-cz', // Czech (Czech Republic)
  'cy-gb', // Welsh (United Kingdom)
  'da-dk', // Danish (Denmark)
  'de-at', // German (Austria)
  'de-ch', // German (Switzerland)
  'de-de', // German (Germany)
  'el-gr', // Greek (Greece)
  'en-gb', // English (United Kingdom)
  'en-ie', // English (Ireland)
  'et-ee', // Estonian (Estonia)
  'fi-fi', // Finnish (Finland)
  'fr-be', // French (Belgium)
  'fr-ch', // French (Switzerland)
  'fr-fr', // French (France)
  'ga-ie', // Irish (Ireland)
  'hr-hr', // Croatian (Croatia)
  'hu-hu', // Hungarian (Hungary)
  'is-is', // Icelandic (Iceland)
  'it-ch', // Italian (Switzerland)
  'it-it', // Italian (Italy)
  'lb-lu', // Luxembourgish (Luxembourg)
  'lt-lt', // Lithuanian (Lithuania)
  'lv-lv', // Latvian (Latvia)
  'mk-mk', // Macedonian (North Macedonia)
  'mt-mt', // Maltese (Malta)
  'nl-be', // Dutch (Belgium)
  'nl-nl', // Dutch (Netherlands)
  'no-no', // Norwegian (Norway)
  'pl-pl', // Polish (Poland)
  'pt-pt', // Portuguese (Portugal)
  'ro-ro', // Romanian (Romania)
  'ru-ru', // Russian (Russia)
  'sk-sk', // Slovak (Slovakia)
  'sl-si', // Slovenian (Slovenia)
  'sr-rs', // Serbian (Serbia)
  'sv-se', // Swedish (Sweden)
  'uk-ua' // Ukrainian (Ukraine)
]

const OPTED_IN_LOCALES = [...EU_LOCALES]

const userPrefersQuery = (): boolean => {
  const prefersOldBrowser = localStorage.getItem('prefersOldBrowser')
  const doesPreferQuery = prefersOldBrowser === 'false'
  return doesPreferQuery || prefersOldBrowser === null
}

export const optedInByRegion = (): boolean => {
  return (
    OPTED_IN_LOCALES.includes(navigator.language.toLowerCase()) &&
    userPrefersQuery()
  )
}
