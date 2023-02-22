import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './input_date.module.css';

export function InputDate({
  branch,
  value,
  onFieldChange,
}) {
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
