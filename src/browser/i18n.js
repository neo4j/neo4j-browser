import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      'graph summary':
        'Displaying {{nodeCount}} nodes, {{relationshipCount}} relationships.',
      'Relationship types': 'Relationship types',
      'Node labels': 'Node labels'
    }
  },
  zh: {
    translation: {
      'graph summary': '总计 {{nodeCount}} 个节点, {{relationshipCount}} 条边.',
      'Relationship types': '关系类型',
      'Node labels': '节点类型'
    }
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  interpolation: {
    escapeValue: false
  }
})

export default i18n
