import styles from "./input_textarea.module.css";

export default function InputTextarea({
  branch,
  value,
  onFieldChange,
}) {
  return (
    <div>
      <textarea
        className={styles.inputtext}
        value={value}
        onChange={(e) => onFieldChange(branch, e.target.value)}
      />
    </div>
  );
}
