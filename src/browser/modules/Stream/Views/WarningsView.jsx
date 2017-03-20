import { StyledCypherMessage, StyledCypherWarningMessage, StyledCypherErrorMessage, StyledHelpContent,
  StyledH4, StyledPreformattedArea, StyledHelpDescription, StyledDiv, StyledBr, StyledHelpFrame} from '../styled'

const getWarningComponent = (severity) => {
  if (severity === 'ERROR') {
    return (<StyledCypherErrorMessage>{severity}</StyledCypherErrorMessage>)
  } else if (severity === 'WARNING') {
    return (<StyledCypherWarningMessage>{severity}</StyledCypherWarningMessage>)
  } else {
    return (<StyledCypherMessage>{severity}</StyledCypherMessage>)
  }
}

const WarningsView = ({notifications, cypher}) => {
  let cypherLines = cypher.split('\n')
  cypherLines[0] = cypherLines[0].replace(/^EXPLAIN /, '')

  let notificationsList = notifications.map((notification) => {
    return (
      <StyledHelpContent>
        <StyledHelpDescription>
          {getWarningComponent(notification.severity)}
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
