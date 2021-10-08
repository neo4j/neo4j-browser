import React from 'react'
import { ComponentStory } from '@storybook/react'
import { ConfirmationButton } from 'browser-components/buttons/ConfirmationButton'

export default {
  title: 'Test/ConfirmationButton',
  component: ConfirmationButton
}

const Template: ComponentStory<typeof ConfirmationButton> = args => (
  <ConfirmationButton {...args} />
)

export const Normal = Template.bind({})
Normal.args = {
  confirmIcon: <div> yes, im sure </div>,
  cancelIcon: <div> no, don't! </div>,
  requestIcon: <div> do thing </div>
}
