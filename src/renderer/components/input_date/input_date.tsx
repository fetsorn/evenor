import styles from "./input_date.module.css";
import { useTranslation } from "react-i18next";

interface IInputDateProps {
  description?: any;
  label?: any;
  value?: any;
  onInputChange?: any;
  onInputRemove?: any;
}

export default function InputDate({
  description,
  label,
  value,
  onInputChange,
  onInputRemove,
}: IInputDateProps) {
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
