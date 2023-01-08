import styles from "./form_date_input.module.css";
import { useTranslation } from "react-i18next";

interface IFormDateInputProps {
  description?: any;
  label?: any;
  value?: any;
  onInputChange?: any;
  onInputRemove?: any;
}

export default function FormDateInput({
  description,
  label,
  value,
  onInputChange,
  onInputRemove,
}: IFormDateInputProps) {
  const { t } = useTranslation();
  return (
    <div>
      <label>
        {description}
        <button
          title={t("line.button.remove", { field: label })}
          onClick={onInputRemove}
        >
          X
        </button>
        <br />
        <input
          className={styles.input}
          type="date"
          value={value}
          onChange={(e) => onInputChange(label, e.target.value)}
        />
      </label>
    </div>
  );
}
