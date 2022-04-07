import styles from '../../SidebarEdit.module.css'

const TextInput = ({label, value, onChange}) => {

  return (
    <div>
      <label>{label}
        <input className={styles.input}
               type="text"
               value={value}
               onChange={onChange}
        />
      </label>
      <br/>
    </div>
  )
}

export default TextInput
