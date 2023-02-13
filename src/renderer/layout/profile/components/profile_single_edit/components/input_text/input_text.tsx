import { useTranslation } from "react-i18next";
import styles from "./input_text.module.css";

interface IInputTextProps {
  branch: any;
  value: any;
  list?: any;
  description: any;
  onFieldChange: any;
  onFieldRemove: any;
}

export default function InputText({
  branch,
  value,
  list,
  description,
  onFieldChange,
  onFieldRemove,
}: IInputTextProps) {
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
        type="text"
        list={list}
        value={value}
        onChange={(e) => onFieldChange(branch, e.target.value)}
      />
    </div>
  );
}
