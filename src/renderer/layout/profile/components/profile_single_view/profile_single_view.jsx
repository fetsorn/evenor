import React from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import {
  AssetView,
  Button,
  Title,
} from '@/components/index.js';
import { useStore } from '@/store/index.js';
import {
  ViewField,
} from './components/index.js';
import styles from './profile_single_view.module.css';

// TODO: replace with Day.js
function isDate(title) {
  return true;
}

// TODO: replace with Day.js
function formatDate(title) {
  return isDate(title) ? title : title;
}

export function ProfileSingleView() {
  const { t } = useTranslation();

  const [
    entry,
    schema,
    group,
    index,
    onEntryEdit,
    onEntryClose,
    onEntryDelete,
  ] = useStore((state) => [
    state.entry,
    state.schema,
    state.group,
    state.index,
    state.onEntryEdit,
    state.onEntryClose,
    state.onEntryDelete,
  ]);

  const title = formatDate(group);

  const addedBranches = entry ? Object.keys(entry).filter((b) => b !== '|') : [];

  return (
    <div className={cn(styles.sidebar, { [styles.invisible]: !entry })}>
      {entry && schema && (
        <div className={styles.container}>
          <div id="scrollcontainer" className={styles.sticky}>
            <Title>
              {title}
              {' '}
              {index}
            </Title>

            <div className={styles.buttonbar}>
              <Button type="button" title={t('line.button.edit')} onClick={onEntryEdit}>
                ✏️
              </Button>

              <Button type="button" title={t('line.button.delete')} onClick={onEntryDelete}>
                🗑️
              </Button>

              <Button type="button" title={t('line.button.close')} onClick={onEntryClose}>
                X
              </Button>
            </div>

            <div>
              {addedBranches.map((branch) => (
                <div key={`view${branch}`}>
                  <ViewField entry={
                    schema[branch]?.type === 'array' || schema[branch]?.type === 'object'
                      ? entry[branch]
                      : { '|': branch, [branch]: entry[branch] }
                  }
                  />
                </div>
              ))}
            </div>

            <AssetView filepath={entry?.FILE_PATH} />
          </div>
        </div>
      )}
    </div>
  );
}
