import {Component} from 'preact'
import styles from './style.css'
import { MinusIcon, RightArrowIcon, CancelIcon } from 'browser-components/icons/Icons'

export class ConfirmationButton extends Component {
  constructor (props) {
    super(props)

    this.state = {
      requested: false
    }
  }

  componentWillMount () {
    this.confirmIcon = this.props.confirmIcon || (<RightArrowIcon />)
    this.cancelIcon = this.props.cancelIcon || (<CancelIcon />)
    this.requestIcon = this.props.requestIcon || (<MinusIcon />)
  }

  render () {
    if (this.state.requested) {
      return (
        <div>
          <button className={styles.icon} onClick={() => { this.setState({ requested: false }); this.props.onConfirmed() }}>{this.confirmIcon}</button>
          <button className={styles.icon} onClick={() => this.setState({ requested: false })}>{this.cancelIcon}</button>
        </div>
      )
    } else {
      return (<button className={styles.icon} onClick={() => this.setState({ requested: true })}>{this.requestIcon}</button>)
    }
  }

}
