import i18n from 'i18next'
import { resources } from 'neo4j-arc/graph-visualization'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  resources,
  lng: 'zh',
  interpolation: {
    escapeValue: false
  }
})

export default i18n
