import styles from "./form_date_input.module.css";
import { useTranslation } from "react-i18next";

interface IFormDateInputProps {
  description?: any;
  label?: any;
  value?: any;
  onChange?: any;
  onRemove?: any;
}

export default function FormDateInput({
  description,
  label,
  value,
  onChange,
  onRemove,
}: IFormDateInputProps) {
  const { t } = useTranslation();
  return (
    <div>
      <label>
        {description}
        <button
          title={t("line.button.remove", { field: label })}
          onClick={onRemove}
        >
          X
        </button>
        <br />
        <input
          className={styles.input}
          type="date"
          value={value}
          onChange={(e) => onChange(label, e.target.value)}
        />
      </label>
    </div>
  );
}
