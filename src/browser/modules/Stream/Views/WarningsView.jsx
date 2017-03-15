const WarningsView = ({notifications, cypher}) => {
  console.log(notifications)
  let cypherLines = cypher.split('\n')
  console.log(cypherLines)

  /* TODO WAS IS DAS??
   <pre cypher-hint="message" cypher-input="EXPLAIN MATCH (m:Movie)
   MATCH (p:Perso)--(m) return p"
   */
  let notificationsList = notifications.map((notification) => {
    return (
      <div>
        <div className='cypher-message cypher-message-warning'>{notification.severity}</div>
        <h4>{notification.title}</h4>
        <p>{notification.description}</p>
        <pre>{cypherLines[notification.position.line - 1]}
          <br />{Array(notification.position.column).join(' ')}^</pre>
      </div>
    )
  }
  )
  return (
    <div className='cypher-messages'>
      {notificationsList}
    </div>)
}

export default WarningsView
