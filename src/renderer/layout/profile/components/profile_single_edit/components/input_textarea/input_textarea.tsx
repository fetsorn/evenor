import styles from "./input_textarea.module.css";
import { useTranslation } from "react-i18next";

interface IInputTextareaProps {
  description?: any;
  label?: any;
  value: any;
  onFieldChange: any;
  onFieldRemove: any;
}

export default function InputTextarea({
  description,
  label,
  value,
  onFieldChange,
  onFieldRemove,
}: IInputTextareaProps) {
  const { t } = useTranslation();
  return (
    <div>
      <label>
        {description}
        <button
          title={t("line.button.remove", { field: label })}
          onClick={() => onFieldRemove(label)}
        >
          X
        </button>
        <br />
        <textarea
          className={styles.inputtext}
          value={value}
          onChange={(e) => onFieldChange(label, e.target.value)}
        />
      </label>
    </div>
  );
}
