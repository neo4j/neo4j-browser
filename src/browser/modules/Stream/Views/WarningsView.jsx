import { StyledCypherMessage, StyledCypherWarningMessage, StyledCypherErrorMessage, StyledHelpContent,
  StyledH4, StyledPreformattedArea, StyledHelpDescription, StyledDiv, StyledBr, StyledHelpFrame} from '../styled'

const WarningsView = ({notifications, cypher}) => {
  let cypherLines = cypher.split('\n')
  cypherLines[0] = cypherLines[0].replace(/^EXPLAIN /, '')
  let notificationsList = notifications.map((notification) => {
    return (
      <StyledHelpContent>
        <StyledHelpDescription>
          {
            notification.severity === 'WARNING'
            ? (<StyledCypherWarningMessage>
              {notification.severity}
            </StyledCypherWarningMessage>)
            : (notification.severity === 'ERROR'
              ? (<StyledCypherErrorMessage>
                {notification.severity}
              </StyledCypherErrorMessage>)
                : (<StyledCypherMessage>
                  {notification.severity}
                </StyledCypherMessage>)
              )
          }
          <StyledH4>{notification.title}</StyledH4>
        </StyledHelpDescription>
        <StyledDiv>
          <StyledHelpDescription>{notification.description}</StyledHelpDescription>
          <StyledDiv>
            <StyledPreformattedArea>{cypherLines[notification.position.line - 1]}
              <StyledBr />{Array(notification.position.column).join(' ')}^
            </StyledPreformattedArea>
          </StyledDiv>
        </StyledDiv>
      </StyledHelpContent>
    )
  })
  return (
    <StyledHelpFrame>
      {notificationsList}
    </StyledHelpFrame>)
}

export default WarningsView
