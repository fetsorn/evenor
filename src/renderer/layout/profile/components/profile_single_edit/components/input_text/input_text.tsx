import styles from "./input_text.module.css";
import { useTranslation } from "react-i18next";

interface IInputTextProps {
  label?: any;
  description?: any;
  value?: any;
  list?: any;
  onFieldChange?: any;
  onFieldRemove?: any;
}

export default function InputText({
  label,
  description,
  value,
  list,
  onFieldChange,
  onFieldRemove,
}: IInputTextProps) {
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
        <input
          className={styles.input}
          type="text"
          list={list}
          value={value}
          onChange={(e) => onFieldChange(label, e.target.value)}
        />
      </label>
    </div>
  );
}
