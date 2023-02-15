import styles from "./input_textarea.module.css";

interface IInputTextareaProps {
  branch: any;
  value: any;
  onFieldChange: any;
}

export default function InputTextarea({
  branch,
  value,
  onFieldChange,
}: IInputTextareaProps) {
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
