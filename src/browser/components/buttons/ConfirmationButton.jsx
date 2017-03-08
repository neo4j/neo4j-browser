import {Component} from 'preact'
import styles from './style.css'
import { MinusIcon, RightArrowIcon, CancelIcon } from 'browser-components/icons/Icons';
import { FormButton } from 'browser-components/buttons'

export class ConfirmationButton extends Component {
  constructor(){
    super();

    this.state = {
      requested : false
    }
  }

  componentWillMount(){
    this.confirmIcon = this.props.confirmIcon || (<RightArrowIcon />);
    this.cancelIcon = this.props.cancelIcon || (<CancelIcon />);
    this.requestIcon = this.props.requestIcon || (<MinusIcon />);
  }

  render(){

    if(this.state.requested){
        return(
          <div>
            <button className={styles.icon} onClick={ ()=> this.props.onConfirmed() }>{this.confirmIcon}</button>
            <button className={styles.icon} onClick={ ()=> this.setState({ requested: false }) }>{this.cancelIcon}</button>
          </div>
        )
    }
    else
      return (<button className={styles.icon} onClick={ ()=> this.setState({ requested: true }) }>{this.requestIcon}</button>)
  }

}
