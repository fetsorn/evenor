import styles from "./input_textarea.module.css";
import { useTranslation } from "react-i18next";

interface IInputTextareaProps {
  description?: any;
  label?: any;
  value: any;
  onInputChange: any;
  onInputRemove: any;
}

export default function InputTextarea({
  description,
  label,
  value,
  onInputChange,
  onInputRemove,
}: IInputTextareaProps) {
  const { t } = useTranslation();
  return (
    <div>
      <label>
        {description}
        <button
          title={t("line.button.remove", { field: label })}
          onClick={() => onInputRemove(label)}
        >
          X
        </button>
        <br />
        <textarea
          className={styles.inputtext}
          value={value}
          onChange={(e) => onInputChange(label, e.target.value)}
        />
      </label>
    </div>
  );
}
