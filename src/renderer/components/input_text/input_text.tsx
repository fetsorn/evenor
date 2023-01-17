import styles from "./input_text.module.css";
import { useTranslation } from "react-i18next";

interface IInputTextProps {
  label?: any;
  description?: any;
  value?: any;
  list?: any;
  onInputChange?: any;
  onInputRemove?: any;
}

export default function InputText({
  label,
  description,
  value,
  list,
  onInputChange,
  onInputRemove,
}: IInputTextProps) {
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
          type="text"
          list={list}
          value={value}
          onChange={(e) => onInputChange(label, e.target.value)}
        />
      </label>
    </div>
  );
}
