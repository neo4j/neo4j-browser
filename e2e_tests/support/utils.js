export const getDesktopContext = (config, connectionCredsType = 'host') => ({
  projects: [
    {
      graphs: [
        {
          status: 'ACTIVE',
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
    obj.url = `bolt://${config('boltHost')}:${config('boltPort')}`
  } else {
    obj.host = config('boltHost')
    obj.port = config('boltPort')
  }
  return obj
}
