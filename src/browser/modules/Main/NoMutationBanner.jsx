import React from 'react'
import { StyledSyncReminderSpan, NoMutationBannerStyle } from './styled'
import Render from 'browser-components/Render'
const NoMutationBanner = React.memo(function NoMutationBanner() {
  return (
    <Render if={true}>
      <NoMutationBannerStyle height="100px">
        <StyledSyncReminderSpan>
          Please don't make queries that mutate the state of this db!
        </StyledSyncReminderSpan>
      </NoMutationBannerStyle>
    </Render>
  )
})
export default NoMutationBanner
