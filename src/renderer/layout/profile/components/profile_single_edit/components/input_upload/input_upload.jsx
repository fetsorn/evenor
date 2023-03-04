import React from 'react';
import { useTranslation } from 'react-i18next';
import { API } from 'lib/api';
import { useStore } from '@/store/index.js';
import { Button } from '@/components/index.js';
import styles from './input_upload.module.css';

export function InputUpload({
  branch,
  value,
  onFieldChange,
}) {
  const { t } = useTranslation();

  const repoUUID = useStore((state) => state.repoUUID);

  async function onFieldUpload(file) {
    console.log('onFieldUpload', branch);
    const api = new API(repoUUID);

    const filepath = await api.uploadFile(file);

    onFieldChange(branch, filepath);
  }

  return (
    <div>
      {__BUILD_MODE__ === 'electron' ? (
        <div>
          <input
            className={styles.input}
            type="text"
            value={value}
            onChange={(e) => onFieldChange(branch, e.target.value)}
          />
          <Button type="button" onClick={() => onFieldUpload()}>
            {t('line.button.upload')}
          </Button>
        </div>
      ) : (
        <input
          type="file"
          onChange={(e) => onFieldUpload(e.target.files[0])}
        />
      )}
    </div>
  );
}
