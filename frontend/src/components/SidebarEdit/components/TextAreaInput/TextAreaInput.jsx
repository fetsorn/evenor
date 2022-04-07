import styles from '../../SidebarEdit.module.css'

const TextAreaInput = ({label, value, onChange}) => {

  return (
    <div>
      <label>{label}
        <textarea className={styles.inputtext}
                  type="text"
                  value={value}
                  onChange={onChange}
        />
      </label>
      <br/>
    </div>
  )
}

export default TextAreaInput
