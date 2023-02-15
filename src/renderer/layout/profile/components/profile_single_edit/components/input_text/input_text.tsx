import styles from "./input_text.module.css";

interface IInputTextProps {
  branch: any;
  value: any;
  list?: any;
  onFieldChange: any;
}

export default function InputText({
  branch,
  value,
  list,
  onFieldChange,
}: IInputTextProps) {
  return (
    <div>
      <input
        className={styles.input}
        type="text"
        list={list}
        value={value}
        onChange={(e) => onFieldChange(branch, e.target.value)}
      />
    </div>
  );
}
