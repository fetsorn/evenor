import styles from "./input_date.module.css";
import { useTranslation } from "react-i18next";

interface IInputDateProps {
  branch?: any;
  value?: any;
  onFieldChange?: any;
}

export default function InputDate({
  branch,
  value,
  onFieldChange,
}: IInputDateProps) {
  const { t } = useTranslation();
  return (
    <div>
      <input
        className={styles.input}
        type="date"
        value={value}
        onChange={(e) => onFieldChange(branch, e.target.value)}
      />
    </div>
  );
}
