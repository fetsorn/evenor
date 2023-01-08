import styles from "./form_textarea_input.module.css";
import { useTranslation } from "react-i18next";

interface ITextAreaInputProps {
  description?: any;
  label?: any;
  value: any;
  onInputChange: any;
  onInputRemove: any;
}

export default function TextAreaInput({
  description,
  label,
  value,
  onInputChange,
  onInputRemove,
}: ITextAreaInputProps) {
  const { t } = useTranslation();
  return (
    <div>
      <label>
        {description}
        <button
          title={t("line.button.remove", { field: label })}
          onClick={onInputRemove}
        >
          X
        </button>
        <br />
        <textarea
          className={styles.inputtext}
          value={value}
          onChange={(e) => onInputChange(label, e.target.value)}
        />
      </label>
    </div>
  );
}
