import {Component} from 'preact'
import styled from 'styled-components'

const StyledSettingTextInput = styled.input`
  height: 34px;
  color: #555;
  font-size: 14px;
  padding: 6px 12px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 192px;
`

const StyledLabel = styled.label`
  margin-left: 10px;
`
const StyledRadioEntry = styled.div`
  margin: 10px 0;
`

export const TextInput = (props) => {
  const {children, ...rest} = props
  return <StyledSettingTextInput {...rest}>{children}</StyledSettingTextInput>
}

export class RadioForm extends Component {
  constructor (props) {
    super(props)
    this.state.selectedValue = this.props.selectedValue || null
  }
  isSelectedValue (option) {
    return option === this.state.selectedValue
  }
  render () {
    return (
      <form>
        {this.props.options.map((option) => {
          return (<StyledRadioEntry>
            <input type='radio' value={option} checked={this.isSelectedValue(option)} onClick={(event) => {
              this.state.selectedValue = option
              this.props.onChange(event)
            }} />
            <StyledLabel>{option}</StyledLabel>
          </StyledRadioEntry>)
        })}
      </form>
    )
  }
}
