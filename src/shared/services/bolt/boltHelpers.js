import bolt from './bolt'

export const getServerConfig = () => {
  return bolt.transaction('CALL dbms.queryJmx("org.neo4j:*")')
        .then((res) => {
          // Find kernel conf
          let conf
          res.records.forEach((record) => {
            if (record.get('name').match(/Configuration$/)) conf = record.get('attributes')
          })
          return conf
        }).catch((e) => {
          return null
        })
}
