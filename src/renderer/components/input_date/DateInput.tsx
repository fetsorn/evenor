import styles from "../../Sidebar.module.css";
import { useTranslation } from "react-i18next";

interface IDateInputProps {
  label?: any;
  value?: any;
  onChange?: any;
  onRemove?: any;
}

const TextInput = ({ label, value, onChange, onRemove }: IDateInputProps) => {
  const { t } = useTranslation();
  return (
    <div>
      <label>
        {label}
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
          onChange={onChange}
        />
      </label>
    </div>
  );
};

export default TextInput;
