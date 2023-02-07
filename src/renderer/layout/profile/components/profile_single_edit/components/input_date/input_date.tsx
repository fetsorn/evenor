import styles from "./input_date.module.css";
import { useTranslation } from "react-i18next";

interface IInputDateProps {
  description?: any;
  label?: any;
  value?: any;
  onFieldChange?: any;
  onFieldRemove?: any;
}

export default function InputDate({
  description,
  label,
  value,
  onFieldChange,
  onFieldRemove,
}: IInputDateProps) {
  const { t } = useTranslation();
  return (
    <div>
      {description}
      <button
        title={t("line.button.remove", { field: label })}
        onClick={() => onFieldRemove(label)}
      >
          X
      </button>
      <br />
      <input
        className={styles.input}
        type="date"
        value={value}
        onChange={(e) => onFieldChange(label, e.target.value)}
      />
    </div>
  );
}
