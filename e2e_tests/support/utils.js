/* global Cypress */

export const isEnterpriseEdition = () =>
  Cypress.config('serverEdition') === 'enterprise'

export const isAura = () => Cypress.config('serverEdition') === 'aura'

export const isHttps = () => Cypress.config('baseUrl').startsWith('https')

export const getDesktopContext = (
  config,
  connectionCredsType = 'host',
  status = 'ACTIVE'
) => ({
  projects: [
    {
      graphs: [
        {
          status,
          connection: {
            type: 'REMOTE',
            configuration: {
              protocols: {
                bolt: getBoltConfig(config, connectionCredsType),
                http: {
                  enabled: true,
                  username: 'neo4j',
                  password: config('password'),
                  host: 'localhost',
                  port: '7474'
                }
              }
            }
          }
        }
      ]
    }
  ]
})

const getBoltConfig = (config, type) => {
  const obj = {
    enabled: true,
    username: 'neo4j',
    password: config('password'),
    tlsLevel: config('baseUrl').startsWith('https') ? 'REQUIRED' : 'OPTIONAL'
  }
  if (type === 'url') {
    obj.url = config('boltUrl')
  } else {
    obj.host = config('boltHost')
    obj.port = config('boltPort')
  }
  return obj
}

export const stripScheme = url => {
  const [_scheme, ...rest] = (url || '').split('://')
  if (!rest || !rest.length) {
    return _scheme
  }
  return rest.join('://')
}

export const schemeWithEncryptionFlag = scheme =>
  `${scheme}${isHttps() ? '+s' : ''}://`
export const schemeWithInvertedEncryptionFlag = scheme =>
  `${scheme}${!isHttps() ? '+s' : ''}://`
