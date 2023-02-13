import styles from "./input_date.module.css";
import { useTranslation } from "react-i18next";

interface IInputDateProps {
  branch?: any;
  value?: any;
  description?: any;
  onFieldChange?: any;
  onFieldRemove?: any;
}

export default function InputDate({
  branch,
  value,
  description,
  onFieldChange,
  onFieldRemove,
}: IInputDateProps) {
  const { t } = useTranslation();
  return (
    <div>
      {description}
      <button
        title={t("line.button.remove", { field: branch })}
        onClick={() => onFieldRemove(branch)}
      >
          X
      </button>
      <br />
      <input
        className={styles.input}
        type="date"
        value={value}
        onChange={(e) => onFieldChange(branch, e.target.value)}
      />
    </div>
  );
}
