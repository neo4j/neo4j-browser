import styles from './style.css'
const Slide = ({html}) => {
  return (<div className={styles.slide} dangerouslySetInnerHTML={{__html: html}} />)
}

export default Slide
