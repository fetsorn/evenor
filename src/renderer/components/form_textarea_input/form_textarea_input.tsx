import styles from "./form_textarea_input.module.css";
import { useTranslation } from "react-i18next";

interface ITextAreaInputProps {
  description?: any;
  label?: any;
  value?: any;
  onChange?: any;
  onRemove?: any;
}

export default function TextAreaInput({
  description,
  label,
  value,
  onChange,
  onRemove,
}: ITextAreaInputProps) {
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
        <textarea
          className={styles.inputtext}
          value={value}
          onChange={onChange}
        />
      </label>
    </div>
  );
}
