import styles from "./input_textarea.module.css";
import { useTranslation } from "react-i18next";

interface IInputTextareaProps {
  branch: any;
  value: any;
  description: any;
  onFieldChange: any;
  onFieldRemove: any;
}

export default function InputTextarea({
  branch,
  value,
  description,
  onFieldChange,
  onFieldRemove,
}: IInputTextareaProps) {
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
      <textarea
        className={styles.inputtext}
        value={value}
        onChange={(e) => onFieldChange(branch, e.target.value)}
      />
    </div>
  );
}
