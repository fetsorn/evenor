import styles from "./input_text.module.css";

export default function InputText({
  branch,
  value,
  options,
  onFieldChange,
}) {
  return (
    <div>
      <input
        className={styles.input}
        type="text"
        list={branch}
        value={value}
        onChange={(e) => onFieldChange(branch, e.target.value)}
      />

      {options?.length > 0 && (
        <datalist id={branch}>
          {options.map((option, idx) => (
            <option key={idx} value={option}></option>
          ))}
        </datalist>
      )}
    </div>
  );
}
