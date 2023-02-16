import styles from "./input_text.module.css";

interface IInputTextProps {
  branch: any;
  value: any;
  options?: any[];
  onFieldChange: any;
}

export default function InputText({
  branch,
  value,
  options,
  onFieldChange,
}: IInputTextProps) {
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
          {options.map((option: any, idx: any) => (
            <option key={idx} value={option}></option>
          ))}
        </datalist>
      )}
    </div>
  );
}
