const EMEA_LOCALES = [
  'bg-bg',
  'cs-cz',
  'cy-gb',
  'da-dk',
  'de-de',
  'el-gr',
  'en-gb',
  'et-ee',
  'fi-fi',
  'fr-fr',
  'ga-ie',
  'hr-hr',
  'hu-hu',
  'is-is',
  'it-it',
  'lb-lu',
  'lt-lt',
  'lv-lv',
  'mk-mk',
  'mt-mt',
  'nl-nl',
  'no-no',
  'pl-pl',
  'pt-pt',
  'ro-ro',
  'ru-ru',
  'sk-sk',
  'sl-si',
  'sr-rs',
  'sv-se',
  'uk-ua'
]

const APAC_LOCALES = [
  'as-in',
  'az-az',
  'bn-bd',
  'bn-in',
  'bo-cn',
  'fil-ph',
  'gu-in',
  'hi-in',
  'hy-am',
  'id-id',
  'ja-jp',
  'ka-ge',
  'km-kh',
  'kn-in',
  'ko-kr',
  'lo-la',
  'ml-in',
  'mn-mn',
  'mr-in',
  'ms-my',
  'my-mm',
  'ne-np',
  'or-in',
  'pa-in',
  'ps-af',
  'sa-in',
  'si-lk',
  'ta-in',
  'te-in',
  'th-th',
  'tr-tr',
  'ug-cn',
  'ur-in',
  'ur-pk',
  'vi-vn',
  'zh-cn',
  'zh-hk',
  'zh-tw'
]

const AMERICAS_LOCALES = [
  'ay-bo',
  'en-029',
  'en-ca',
  'en-us',
  'es-419',
  'es-ar',
  'es-bo',
  'es-cl',
  'es-co',
  'es-cr',
  'es-cu',
  'es-do',
  'es-ec',
  'es-gq',
  'es-gt',
  'es-hn',
  'es-mx',
  'es-ni',
  'es-pa',
  'es-pe',
  'es-pr',
  'es-py',
  'es-sv',
  'es-uy',
  'es-ve',
  'fr-029',
  'fr-ca',
  'gn-py',
  'pt-419',
  'pt-br',
  'qu-pe'
]

const OPTED_IN_LOCALES = [...EMEA_LOCALES]

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
