import styles from "../../Sidebar.module.css";
import { useTranslation } from "react-i18next";

interface ITextAreaInputProps {
  label?: any;
  value?: any;
  onChange?: any;
  onRemove?: any;
}

const TextAreaInput = ({
  label,
  value,
  onChange,
  onRemove,
}: ITextAreaInputProps) => {
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
        <textarea
          className={styles.inputtext}
          value={value}
          onChange={onChange}
        />
      </label>
    </div>
  );
};

export default TextAreaInput;
