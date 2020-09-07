/* global Cypress */

export const isEnterpriseEdition = (): boolean =>
  Cypress.config('serverEdition') === 'enterprise'

export const isAura = (): boolean =>
  Cypress.config('serverEdition').startsWith('aura')

export const isHttps = (): boolean =>
  Cypress.config('baseUrl').startsWith('https')

export const getDesktopContext = (
  config: (config: string) => any,
  connectionCredsType = 'host',
  status = 'ACTIVE'
): any => ({
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

const getBoltConfig = (config: any, type: any) => {
  const obj: any = {
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

export const stripScheme = (url: string): string => {
  const [_scheme, ...rest] = (url || '').split('://')
  if (!rest || !rest.length) {
    return _scheme
  }
  return rest.join('://')
}

export const schemeWithEncryptionFlag = (scheme: string): string =>
  `${scheme}${isHttps() ? '+s' : ''}://`
export const schemeWithInvertedEncryptionFlag = (scheme: string): string =>
  `${scheme}${!isHttps() ? '+s' : ''}://`
