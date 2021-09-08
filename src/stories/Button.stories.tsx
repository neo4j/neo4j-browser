import React from 'react'
import { ComponentMeta } from '@storybook/react'

import ClipboardCopier, {
  ClipboardCopierProps
} from '../browser/components/ClipboardCopier'

export default {
  title: 'Buttons/ClipboardCopier',
  component: ClipboardCopier,
  argTypes: {}
} as ComponentMeta<typeof ClipboardCopier>

const Template = (args: ClipboardCopierProps) => <ClipboardCopier {...args} />

export const Test = Template.bind({})
//@ts-ignore
Test.args = {
  textToCopy: 'hej'
}
