import Editor from '../Editor/Editor'
import Stream from '../Stream/Stream'
import styles from './style.css'

const Main = (props) => {
  return (
    <div className={styles.main}>
      <Editor />
      <Stream />
    </div>
  )
}

export default Main
