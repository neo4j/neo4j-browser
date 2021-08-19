import * as React from 'react'
import styled from 'styled-components'

interface IOption {
  value: string
  key: string
  description: React.ReactNode
}

const Container = styled.div`
  margin: 10px 0;
`
const BoldSpan = styled.span`
  font-weight: bold;
`
const ItalicSpan = styled.span`
  font-style: italic;
`
const UnderlineSpan = styled.span`
  text-decoration: underline;
`
const DisplaySpan = styled.span`
  margin-left: 5px;
  vertical-align: middle;
`
const Input = styled.input`
  vertical-align: middle;
`
export const includePropertyNameKey = 'include-property-name'
export const replaceUnderscoresWithSpaces = 'replace-underscores-with-spaces'
export const setupLabelDisplaySettingsOptions: IOption[] = [
  {
    key: includePropertyNameKey,
    value: 'true',
    description: <DisplaySpan>Include property name</DisplaySpan>
  },
  {
    key: 'font-weight',
    value: 'bold',
    description: (
      <DisplaySpan>
        <BoldSpan>Bold</BoldSpan> text
      </DisplaySpan>
    )
  },
  {
    key: 'font-style',
    value: 'italic',
    description: (
      <DisplaySpan>
        <ItalicSpan>Italic</ItalicSpan> text
      </DisplaySpan>
    )
  },
  {
    key: 'text-decoration',
    value: 'underline',
    description: (
      <DisplaySpan>
        <UnderlineSpan>Underline</UnderlineSpan> text
      </DisplaySpan>
    )
  },
  {
    key: replaceUnderscoresWithSpaces,
    value: 'true',
    description: <DisplaySpan>Replace underscores with spaces</DisplaySpan>
  }
]
export type ISetupLabelDisplaySettingsOnChange = (props: {
  key: string
  value: string | null
}) => void

interface IProps {
  isCustom: boolean
  itemStyle: { [key: string]: string }
  onChange: ISetupLabelDisplaySettingsOnChange
}

const SetupLabelDisplaySettings: React.FC<IProps> = ({
  itemStyle,
  onChange,
  isCustom
}) => (
  <Container>
    {setupLabelDisplaySettingsOptions.map(t => (
      <SetupLabelDisplaySettingsItemMemoed
        key={t.key}
        option={t}
        currentValue={itemStyle[t.key]}
        onChange={onChange}
        isCustom={isCustom}
      />
    ))}
  </Container>
)

interface ISetupLabelDisplaySettingsItemProps
  extends Pick<IProps, 'onChange' | 'isCustom'> {
  option: IOption
  currentValue: string
}

const SetupLabelDisplaySettingsItem: React.FC<ISetupLabelDisplaySettingsItemProps> = ({
  option,
  currentValue,
  onChange,
  isCustom
}) => {
  const isChecked = currentValue === option.value
  const handleChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void = React.useCallback(() => {
    onChange({ key: option.key, value: isChecked ? null : option.value })
  }, [isChecked, option, onChange])
  const disabled = React.useMemo(() => {
    return option.key === includePropertyNameKey && isCustom
  }, [isCustom, option])
  return (
    <div>
      <label>
        <Input
          type={'checkbox'}
          value={option.value}
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
        />
        {option.description}
      </label>
    </div>
  )
}
const SetupLabelDisplaySettingsItemMemoed = React.memo(
  SetupLabelDisplaySettingsItem
)
export default SetupLabelDisplaySettings
