import React from 'react'

const title = 'Commands'
const subtitle = 'Typing commands is 1337'
const content = types => (
  <React.Fragment>
    <p>
      In addition to composing and running Cypher queries, the editor bar up
      above ↑ understands a few client-side commands, which begin with a
      <code>:</code>. Without a colon, we'll assume you're trying to enter a
      Cypher query.
    </p>
    <table className='table-condensed table-help table-help--commands'>
      <tbody>
        {Object.keys(types).map((type, i) => {
          const usage = type === 'help' ? 'topic' : 'guide | url'
          return (
            <React.Fragment key={`${type}-${i}`}>
              <tr className='table-help--header'>
                <th>{types[type].title}</th>
                <th />
              </tr>
              <tr>
                <th>Usage:</th>
                <td>
                  <code>{`:${type} <${usage}>`}</code>
                </td>
              </tr>
              {types[type].commands.map((command, j) => {
                const attrs = { [`${type}-topic`]: command.command }
                return (
                  <tr key={`${command.title}-${i}-${j}`}>
                    <th>{command.title}:</th>
                    <td>
                      <a {...attrs}>{`:${type} ${command.command}`}</a>
                    </td>
                  </tr>
                )
              })}
            </React.Fragment>
          )
        })}
      </tbody>
    </table>
  </React.Fragment>
)

export default { title, subtitle, content }
